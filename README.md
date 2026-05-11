# MongoDB Vector Search - TypeScript Version

This project is a TypeScript conversion of the MongoDB Vector Search application.

## Features
- **Generate Embeddings**: Fetches embeddings from Voyage AI and stores them in MongoDB.
- **Vector Search**: Performs semantic search using MongoDB's `$vectorSearch` operator.
- **TypeScript**: Built with TypeScript for type safety and better developer experience.

## Prerequisites
- Node.js installed
- MongoDB Atlas cluster with a vector search index named `voyage_vector_index` on the `listingsAndReviews` collection.
- Voyage AI API Key

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in `.env`:
   - `PORT`: Server port (default: 3000)
   - `MONGODB_URI`: Your MongoDB connection string
   - `DATABASE_NAME`: `sample_airbnb`
   - `VOYAGE_API_KEY`: Your Voyage AI API key
   - `VOYAGE_MODEL`: `voyage-3`
   - `VOYAGE_BASE_URL`: `https://api.voyageai.com/v1/embeddings`

## Running the App
```bash
npm run dev
```

## API Endpoints
- **POST `/api/listings/generate-embeddings`**: Starts the process of generating embeddings for all listings in the background.
- **GET `/api/listings/perform-vector-search?query=your+search+query`**: Returns semantic search results for the given query.
