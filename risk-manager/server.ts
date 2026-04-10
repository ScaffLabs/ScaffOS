import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import logger, { logStartupConfig } from './logger';
import { errorHandler } from './errors';
import gracefulShutdown from './gracefulShutdown';
import { createPool } from 'mysql2/promise';
import { healthCheckServices } from './externalService';
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

// Middleware for size limit and content type validation
app.use(express.json({ limit: '1mb' })); // Limit request body size to 1mb
app.use((req, res, next) => {
    if (req.is('application/json')) {
        next();
    } else {
        res.status(415).json({ error: 'Unsupported Media Type. Only application/json is accepted.' });
    }
});

app.use('/api', apiRouter);
app.use('/health', healthRouter);
app.use(errorHandler);

const startServer = async () => {
    logStartupConfig();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
};

process.on('SIGTERM', async () => {
    await gracefulShutdown(dbPool);
});
process.on('SIGINT', async () => {
    await gracefulShutdown(dbPool);
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err);
    gracefulShutdown(dbPool);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection: ', reason);
});

const monitorMemoryUsage = () => {
    const memoryUsage = process.memoryUsage();
    logger.info(`Memory Usage: RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
};

setInterval(monitorMemoryUsage, 60000);

startServer();