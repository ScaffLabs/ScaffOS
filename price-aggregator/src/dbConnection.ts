import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const TIMEOUT = 5000; // Timeout for queries

export const createConnectionPool = () => {
    return {
        query: async (text: string, params?: any[]) => {
            const queryPromise = pool.query(text, params);
            return Promise.race([
                queryPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), TIMEOUT)),
            ]);
        },
        drain: async () => {
            await pool.end();
        },
    };
};