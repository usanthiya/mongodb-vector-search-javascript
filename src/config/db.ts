import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI, DATABASE_NAME } from './env.js';

let db: Db;
let client: MongoClient;

export const connectToDatabase = async (): Promise<Db> => {
    if (db) return db;

    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas');
        db = client.db(DATABASE_NAME);
        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
};

export const getDb = (): Db => {
    if (!db) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return db;
};

export const closeDatabaseConnection = async (): Promise<void> => {
    if (client) {
        await client.close();
        console.log('MongoDB connection closed');
    }
};
