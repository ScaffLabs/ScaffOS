import { createPool, Pool } from 'mysql';
import env from '../config';
import logger from './logger';

let pool: Pool;

export const createConnectionPool = () => {
    pool = createPool({
        connectionLimit: 10,
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASS,
        database: env.DB_NAME,
    });
    logger.info('Connection pool created successfully.');
    return pool;
};

export const query = (sql: string, values?: any[]) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) {
                logger.error('Query error', { error: error.message });
                return reject(error);
            }
            resolve(results);
        });
    });
};

export const closeConnectionPool = () => {
    return new Promise((resolve, reject) => {
        pool.end(err => {
            if (err) {
                logger.error('Error closing database connections', { error: err.message });
                return reject(err);
            }
            logger.info('Closed connection pool.');
            resolve();
        });
    });
};

export const withTimeout = async (promise: Promise<any>, ms: number) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Promise timed out')), ms)
    );
    return Promise.race([promise, timeout]);
};

export const executeQueryWithRetry = async (sql: string, values?: any[], retries: number = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await withTimeout(query(sql, values), 5000);
            return result;
        } catch (error) {
            logger.warn('Query attempt failed', { attempt, error: error.message });
            if (attempt === retries) throw error;
            await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000)); // Exponential backoff
        }
    }
};
