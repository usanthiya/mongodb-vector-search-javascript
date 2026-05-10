const { MongoClient } = require('mongodb');
const geminiGateway = require('./geminiGateway');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
const BATCH_SIZE = 500;

async function generateAndStoreEmbeddings() {
    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection('listingsAndReviews');

        let processedDocuments = 0;
        const totalDocuments = await collection.countDocuments();

        while (processedDocuments < totalDocuments) {
            const documents = await collection.find()
                .skip(processedDocuments)
                .limit(BATCH_SIZE)
                .toArray();

            const bulkUpdates = [];

            for (const doc of documents) {
                const description = doc.description;
                if (description) {
                    try {
                        const embeddings = await geminiGateway.getEmbedding(description);
                        if (embeddings) {
                            bulkUpdates.push({
                                updateOne: {
                                    filter: { _id: doc._id },
                                    update: { $set: { embeddings: embeddings } }
                                }
                            });
                        }
                    } catch (e) {
                        console.error(`Error processing doc ${doc._id}:`, e.message);
                    }
                }
            }

            if (bulkUpdates.length > 0) {
                await collection.bulkWrite(bulkUpdates, { ordered: false });
            }

            processedDocuments += documents.length;
            console.log(`Processed ${processedDocuments} out of ${totalDocuments} documents.`);
        }

        console.log('Embedding generation complete for all documents.');
    } catch (error) {
        console.error('Error in generateAndStoreEmbeddings:', error);
        throw error;
    } finally {
        // We don't close here if we want to keep it alive for the app, 
        // but for a one-off script it's good. In Express we might keep it open.
    }
}

async function performVectorSearch(query) {
    try {
        await client.connect();
        const database = client.db(process.env.DATABASE_NAME);
        const collection = database.collection('listingsAndReviews');

        const queryEmbeddings = await geminiGateway.getEmbedding(query);
        const indexName = "vector_index";
        const numCandidates = 150;
        const limit = 10;

        const pipeline = [
            {
                $vectorSearch: {
                    index: indexName,
                    path: "embeddings",
                    queryVector: queryEmbeddings,
                    numCandidates: numCandidates,
                    limit: limit
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    listing_url: 1,
                    description: 1,
                    price: 1
                }
            },
            {
                $limit: 5
            }
        ];

        const results = await collection.aggregate(pipeline).toArray();
        return results;
    } catch (error) {
        console.error('Error in performVectorSearch:', error);
        throw error;
    }
}

module.exports = {
    generateAndStoreEmbeddings,
    performVectorSearch
};
