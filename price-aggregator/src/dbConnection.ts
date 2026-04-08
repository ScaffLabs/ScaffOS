import { Pool } from 'pg'; // Assuming PostgreSQL is the database

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

export const createConnectionPool = () => {
    return {
        query: (text: string, params?: any[]) => pool.query(text, params),
        drain: async () => {
            await pool.end();
        },
    };
};

// Error handling can be added for connection errors and retries.