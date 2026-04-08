import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import logger from './logger';
import { errorHandler } from './errors';
import { createPool } from 'mysql2/promise';
import MemoryQueue from './memoryQueue';

const app = express();
const server = http.createServer(app);

const dbPool = createPool({
    host: 'localhost',
    user: 'root',
    database: 'risk_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());
app.use('/api', apiRouter);
app.use('/health', healthRouter);

app.use(errorHandler); // Global error handler

const gracefulShutdown = async () => {
    logger.info('Shutting down gracefully...');
    await dbPool.end();
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
};

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});
