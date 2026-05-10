const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const listingService = require('./listingService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.post('/api/listings/generate-embeddings', async (req, res) => {
    try {
        // Run in background to avoid timeout
        listingService.generateAndStoreEmbeddings()
            .catch(err => console.error('Background embedding generation error:', err));
        
        res.status(200).json({ message: 'Embeddings generation started in background' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/listings/perform-vector-search', async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "query" is required' });
    }

    try {
        const results = await listingService.performVectorSearch(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
