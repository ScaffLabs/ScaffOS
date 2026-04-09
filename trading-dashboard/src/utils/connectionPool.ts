import { createPool } from 'mysql2/promise';
import config from '../config';

const pool = createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    connectionLimit: 10,
});

export const query = async (sql: string, params: any[]) => {
    const connection = await pool.getConnection();
    try {
        const [results] = await connection.query(sql, params);
        return results;
    } catch (error) {
        throw error;
    } finally {
        connection.release();
    }
};

export const closePool = async () => {
    await pool.end();
};