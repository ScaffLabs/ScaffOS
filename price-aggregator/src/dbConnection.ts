import { Pool } from 'pg';
import { logError } from './logger';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const TIMEOUT = 5000; // Timeout for queries
const MAX_RETRIES = 3;

export const createConnectionPool = () => {
    return {
        query: async (text: string, params?: any[]) => {
            let lastError;
            for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                try {
                    const queryPromise = pool.query(text, params);
                    return await Promise.race([
                        queryPromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), TIMEOUT)),
                    ]);
                } catch (error) {
                    lastError = error;
                    logError(error, { message: `Database query failed (attempt ${attempt + 1})` });
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)); // exponential backoff
                }
            }
            throw new Error(`Database query failed after ${MAX_RETRIES} attempts: ${lastError}`);
        },
        drain: async () => {
            await pool.end();
        },
    };
};