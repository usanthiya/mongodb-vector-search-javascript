import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { seedCandidates, generateCandidateChunksAndEmbeddings, performCandidateHybridSearch } from './services/candidateService.js';
import { connectToDatabase } from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
import { PORT } from './config/env.js';

// Connect to Database at startup
connectToDatabase().catch(err => {
    console.error('Initial DB connection failed', err);
    process.exit(1);
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Candidate Routes
app.post('/api/candidates/seed', async (req: Request, res: Response) => {
    try {
        await seedCandidates();
        res.status(200).json({ message: 'Candidate data seeded successfully. Now call /api/candidates/generate-embeddings' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/candidates/generate-embeddings', async (req: Request, res: Response) => {
    try {
        // Run in background
        generateCandidateChunksAndEmbeddings()
            .catch(err => console.error('Background embedding error:', err));
        
        res.status(200).json({ message: 'Candidate semantic chunking and embedding generation started in background' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/candidates/search', async (req: Request, res: Response) => {
    const query = req.query.query as string;
    const role = req.query.role as string;
    const location = req.query.location as string;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter "query" is required' });
    }

    try {
        const results = await performCandidateHybridSearch(query, role, location);
        res.status(200).json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
