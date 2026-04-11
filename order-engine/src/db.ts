import { Pool } from 'pg';
import { config } from './config';
import logger from './logger';

const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

const retry = async (fn: Function, retries: number = 3, delay: number = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                logger.error('Max retries reached.');
                throw err;
            }
        }
    }
};

export const connectToDatabase = async () => {
    return retry(async () => {
        const client = await pool.connect();
        logger.info('Connected to the database.');
        return client;
    });
};

export const closeDatabaseConnection = async () => {
    await pool.end();
    logger.info('Database connection pool closed.');
};

export const queryDatabase = async (query: string, params: any[]) => {
    const client = await connectToDatabase();
    try {
        const res = await client.query(query, params);
        return res;
    } catch (error) {
        throw error;
    } finally {
        client.release();
    }
};

process.on('exit', async () => {
    await closeDatabaseConnection();
});

process.on('SIGTERM', async () => {
    await closeDatabaseConnection();
});

process.on('SIGINT', async () => {
    await closeDatabaseConnection();
});