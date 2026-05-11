import axios from 'axios';
import { GEMINI_BASE_URL, GEMINI_API_KEY, GEMINI_MODEL} from '../config/env.js';

export const getEmbedding = async (input: string): Promise<number[]> => {
    const url = `${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
        model: GEMINI_MODEL,
        content: {
            parts: [{ text: input }]
        },
        outputDimensionality: 768
    };

    try {
        const response = await axios.post(url, requestBody);
        return response.data.embedding.values;
    } catch (error: any) {
        console.error('Error from Gemini AI:', error.response ? error.response.data : error.message);
        throw error;
    }
};
