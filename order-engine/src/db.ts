import { Pool } from 'pg';

const pool = new Pool({
  user: 'your_user',
  host: 'localhost',
  database: 'your_database',
  password: 'your_password',
  port: 5432,
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
        throw err;
      }
    }
  }
};

export const connectToDatabase = async () => {
  await retry(() => pool.connect());
  console.log('Connected to the database.');
};

export const closeDatabaseConnection = async () => {
  await pool.end();
  console.log('Database connection pool closed.');
};

export const queryDatabase = async (query: string, params: any[]) => {
  return retry(async () => {
    const client = await pool.connect();
    try {
      const res = await client.query(query, params);
      return res;
    } finally {
      client.release();
    }
  });
};
