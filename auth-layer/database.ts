import { Pool } from 'pg';
import config from './config';
import logger from './logger';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    connectionTimeoutMillis: 3000,
});

export const createConnectionPool = () => {
    return {
        query: async (text: string, params: any[]) => {
            const start = Date.now();
            const client = await pool.connect();
            try {
                const res = await client.query(text, params);
                const duration = Date.now() - start;
                logger.info(`Query executed: ${text} - Duration: ${duration}ms`, { params });
                return res;
            } catch (err) {
                logger.error('Query error', err);
                throw err;
            } finally {
                client.release();
            }
        },
        isReady: async () => {
            try {
                await pool.query('SELECT 1');
                return true;
            } catch (err) {
                logger.error('Database connection is not ready', err);
                return false;
            }
        },
        drain: async () => {
            await pool.end();
        },
    };
};