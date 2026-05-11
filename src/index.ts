import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { generateAndStoreEmbeddings, performVectorSearch } from './services/listingService.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
import { PORT } from './config/env.js';

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.post('/api/listings/generate-embeddings', async (req: Request, res: Response) => {
    try {
        // Run in background to avoid timeout
        generateAndStoreEmbeddings()
            .catch(err => console.error('Background embedding generation error:', err));
        
        res.status(200).json({ message: 'Embeddings generation started in background' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/listings/perform-vector-search', async (req: Request, res: Response) => {
    const query = req.query.query as string;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "query" is required' });
    }

    try {
        const results = await performVectorSearch(query);
        res.status(200).json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
