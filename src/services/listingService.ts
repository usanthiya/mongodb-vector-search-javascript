import { MongoClient, ObjectId } from 'mongodb';
import { getEmbedding } from '../gateways/voyageGateway.js';
import { MONGODB_URI, DATABASE_NAME } from '../config/env.js';

interface Listing {
    _id: ObjectId;
    description?: string;
    embeddings?: number[];
    voyage_embeddings?: number[];
    name?: string;
    listing_url?: string;
    price?: number;
}

const client = new MongoClient(MONGODB_URI);
const BATCH_SIZE = 50; // Smaller batch size to stay within Voyage free limits

/**
 * Helper to sleep for a given duration
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateAndStoreEmbeddings = async (): Promise<void> => {
    try {
        await client.connect();
        const database = client.db(DATABASE_NAME);
        const collection = database.collection<Listing>('listingsAndReviews');

        let processedDocuments = 0;
        const totalDocuments = await collection.countDocuments();

        while (processedDocuments < totalDocuments) {
            const documents = await collection.find()
                .skip(processedDocuments)
                .limit(BATCH_SIZE)
                .toArray();

            if (documents.length === 0) break;

            // Filter out docs without descriptions
            const docsWithDescription = documents.filter(doc => !!doc.description);
            const descriptions = docsWithDescription.map(doc => doc.description as string);

            if (descriptions.length > 0) {
                try {
                    console.log(`Fetching embeddings for batch of ${descriptions.length}...`);
                    
                    // CALL VOYAGE IN BATCH (One request for all 50 descriptions)
                    const embeddingsArray = await getEmbedding(descriptions, 'document');

                    if (embeddingsArray && Array.isArray(embeddingsArray)) {
                        const bulkUpdates = docsWithDescription.map((doc, index) => ({
                            updateOne: {
                                filter: { _id: doc._id },
                                update: { $set: { voyage_embeddings: embeddingsArray[index] } }
                            }
                        }));

                        await collection.bulkWrite(bulkUpdates as any, { ordered: false });
                    }

                    // WAIT 20 SECONDS between batches to stay under the "3 Requests Per Minute" free limit
                    // 60 seconds / 3 RPM = 20 seconds per request
                    console.log(`Successfully processed ${descriptions.length} docs. Waiting 20s to respect rate limits...`);
                    await sleep(20000);

                } catch (e: any) {
                    if (e.message.includes('429')) {
                        console.error('Rate limit hit! Waiting 60s before retrying...');
                        await sleep(60000);
                        continue; // Retry the same batch
                    }
                    console.error(`Error processing batch:`, e.message);
                }
            }

            processedDocuments += documents.length;
            console.log(`Overall progress: ${processedDocuments} out of ${totalDocuments} documents.`);
        }

        console.log('Embedding generation complete for all documents.');
    } catch (error) {
        console.error('Error in generateAndStoreEmbeddings:', error);
        throw error;
    }
}

export const performVectorSearch = async (query: string): Promise<Listing[]> => {
    try {
        await client.connect();
        const database = client.db(DATABASE_NAME);
        const collection = database.collection<Listing>('listingsAndReviews');

        const queryEmbeddings = await getEmbedding(query, 'query');
        const indexName = "voyage_vector_index";
        const numCandidates = 150;
        const limit = 10;

        const pipeline = [
            {
                $vectorSearch: {
                    index: indexName,
                    path: "voyage_embeddings",
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

        const results = await collection.aggregate(pipeline).toArray() as Listing[];
        return results;
    } catch (error) {
        console.error('Error in performVectorSearch:', error);
        throw error;
    }
}
