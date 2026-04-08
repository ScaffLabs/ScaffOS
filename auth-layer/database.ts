import { Pool } from 'pg'; // Assuming PostgreSQL
import config from './config';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
});

export const createConnectionPool = () => {
    return {
        query: async (text: string, params: any[]) => {
            const client = await pool.connect();
            try {
                const res = await client.query(text, params);
                return res;
            } catch (err) {
                console.error('Query error', err);
                throw err;
            } finally {
                client.release();
            }
        },
        isReady: () => pool && pool.totalCount > 0,
        drain: async () => {
            await pool.end();
        },
    };
};
