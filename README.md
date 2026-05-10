# MongoDB Vector Search - Node.js Version

This project is a JavaScript/Node.js conversion of the MongoDB Vector Search application originally built with Java/Quarkus.

## Features
- **Generate Embeddings**: Fetches embeddings from Google's Gemini AI and stores them in MongoDB.
- **Vector Search**: Performs semantic search using MongoDB's `$vectorSearch` operator.

## Prerequisites
- Node.js installed
- MongoDB Atlas cluster with a vector search index named `vector_index` on the `listingsAndReviews` collection in the `sample_airbnb` database.
- Gemini AI API Key

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env`:
   - `PORT`: Server port (default: 3000)
   - `MONGODB_URI`: Your MongoDB connection string
   - `DATABASE_NAME`: `sample_airbnb`
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `GEMINI_MODEL`: `gemini-embedding-001`
   - `GEMINI_BASE_URL`: `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent`

## Running the App
```bash
node index.js
```

## API Endpoints
- **POST `/api/listings/generate-embeddings`**: Starts the process of generating embeddings for all listings in the background.
- **GET `/api/listings/perform-vector-search?query=your+search+query`**: Returns semantic search results for the given query.
