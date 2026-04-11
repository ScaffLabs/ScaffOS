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