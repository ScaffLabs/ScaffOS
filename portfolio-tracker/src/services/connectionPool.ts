import { createPool, Pool } from 'mysql';
import env from '../config';

let pool: Pool;

export const createConnectionPool = () => {
    pool = createPool({
        connectionLimit: 10,
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASS,
        database: env.DB_NAME,
    });
    return pool;
};

export const query = (sql: string, values?: any[]) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

export const close = () => {
    return new Promise((resolve, reject) => {
        pool.end(err => {
            if (err) return reject(err);
            resolve();
        });
    });
};
