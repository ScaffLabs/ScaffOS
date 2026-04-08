import { Pool } from 'pg';

const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
});

export const connectToDatabase = async () => {
  await pool.connect();
  console.log('Connected to the database.');
};

export const closeDatabaseConnection = async () => {
  await pool.end();
  console.log('Database connection pool closed.');
};

export const queryDatabase = async (query: string, params: any[]) => {
  const client = await pool.connect();
  try {
    const res = await client.query(query, params);
    return res;
  } finally {
    client.release();
  }
};
