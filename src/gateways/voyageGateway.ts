import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { VoyageAIClient } = require('voyageai');

import { VOYAGE_API_KEY, VOYAGE_MODEL, VOYAGE_RERANK_MODEL } from '../config/env.js';

// Now client will be created from the stable CommonJS version of the library
const client = new (VoyageAIClient as any)({
    apiKey: VOYAGE_API_KEY,
});

/**
 * Get embeddings from Voyage AI using the official SDK.
 * NOTE: For MongoDB Atlas users, consider using "Automated Embedding" (Auto-embedding) 
 * directly in the Atlas index to handle this automatically via the queryText parameter.
 * @param input - The text to embed
 * @param inputType - The type of input ('query' or 'document')
 * @returns The embedding vector(s)
 */
export const getEmbedding = async (input: string | string[], inputType: 'query' | 'document' = 'document'): Promise<any> => {
    try {
        const response = await client.embed({
            model: VOYAGE_MODEL,
            input: input,
            inputType: inputType
        });

        if (Array.isArray(input)) {
            return response.data?.map((item: any) => item.embedding);
        } else {
            return response.data?.[0]?.embedding;
        }
    } catch (error: any) {
        console.error('Error from Voyage AI SDK:', error.message);
        throw error;
    }
};

/**
 * Rerank documents based on a query using Voyage AI
 * @param query - The search query
 * @param documents - List of document strings to rerank
 * @returns Reranked results with scores
 */
export const rerank = async (query: string, documents: string[]): Promise<any> => {
    try {
        // model: "rerank-2" or "rerank-2-lite" are common voyage rerank models
        const response = await client.rerank({
            query: query,
            documents: documents,
            model: VOYAGE_RERANK_MODEL,
            topK: 5
        });
        return response.data;
    } catch (error: any) {
        console.error('Error from Voyage AI Rerank:', error.message);
        throw error;
    }
};
