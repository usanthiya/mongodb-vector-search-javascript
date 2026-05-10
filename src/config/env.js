import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const DATABASE_NAME = process.env.DATABASE_NAME;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL;
export const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL;