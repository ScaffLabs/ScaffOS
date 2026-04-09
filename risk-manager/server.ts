import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import logger, { logStartupConfig } from './logger';
import { errorHandler } from './errors';
import MemoryQueue from './memoryQueue';
import loggingMiddleware from './middleware/loggingMiddleware';
import requestIdMiddleware from './middleware/requestIdMiddleware';
import gracefulShutdown from './gracefulShutdown';
import { createPool } from 'mysql2/promise';
import { healthCheckServices } from './externalService';

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
app.use(requestIdMiddleware);
app.use(loggingMiddleware);
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

setInterval(async () => {
    try {
        const healthStatus = await healthCheckServices();
        logger.info('Health check status: ', healthStatus);
    } catch (error) {
        logger.error('Health check failed: ', error);
    }
}, 60000);

process.on('SIGTERM', async () => {
    await gracefulShutdown(dbPool);
});
process.on('SIGINT', async () => {
    await gracefulShutdown(dbPool);
});

startServer();