import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import logger, { logStartupConfig, requestLogger } from './logger';
import { errorHandler } from './errors';
import gracefulShutdown from './gracefulShutdown';
import { createPool } from 'mysql2/promise';

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
app.use(requestLogger); // Integrate request logger middleware
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

const shutdown = async () => {
    await gracefulShutdown(dbPool);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception: ', err);
    shutdown();
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection: ', reason);
});

startServer();