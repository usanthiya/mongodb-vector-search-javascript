import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || '3000';
export const MONGODB_URI = process.env.MONGODB_URI as string;
export const DATABASE_NAME = process.env.DATABASE_NAME as string;

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
export const GEMINI_MODEL = process.env.GEMINI_MODEL as string;
export const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL as string;

export const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY as string;
export const VOYAGE_MODEL = process.env.VOYAGE_MODEL as string;
export const VOYAGE_BASE_URL = process.env.VOYAGE_BASE_URL as string;