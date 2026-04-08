import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import { setReady } from './healthCheck';
import config from './config';
import { Pool } from 'pg'; // Import PostgreSQL connection pool
import logger from './logger';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use('/api', apiRouter);
app.use('/health', healthRouter);

let connectionPool: Pool;

const initializeConnectionPool = () => {
    connectionPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20, // Set maximum number of connections
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });
};

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await connectionPool.end(); // Gracefully close the pool
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const startServer = async () => {
    initializeConnectionPool();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        setReady(true);
    });
};

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});
