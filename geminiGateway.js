const axios = require('axios');
require('dotenv').config();

const getEmbedding = async (input) => {
    const url = `${process.env.GEMINI_BASE_URL}?key=${process.env.GEMINI_API_KEY}`;
    
    const requestBody = {
        model: process.env.GEMINI_MODEL,
        content: {
            parts: [{ text: input }]
        },
        outputDimensionality: 768
    };

    try {
        const response = await axios.post(url, requestBody);
        return response.data.embedding.values;
    } catch (error) {
        console.error('Error from Gemini AI:', error.response ? error.response.data : error.message);
        throw error;
    }
};

module.exports = {
    getEmbedding
};
