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

export const generateSummaryAnalysis = async (query: string, candidateContext: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
    const prompt = `You are an expert HR assistant. Given a job search query and a candidate's information, explain briefly (2-3 sentences) why this candidate is a good match for the query.
    
Query: ${query}

Candidate Info:
${candidateContext}`;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }]
    };

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
        console.error('Error generating summary from Gemini AI:', error.response ? error.response.data : error.message);
        return "Could not generate summary analysis at this time.";
    }
};
