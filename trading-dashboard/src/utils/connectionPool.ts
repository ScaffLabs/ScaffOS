import { Pool } from 'mysql2/promise';

const pool = Pool.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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