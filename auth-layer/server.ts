import express from 'express';
import http from 'http';
import healthRouter from './health';
import userRoutes from './userRoutes';
import errorMiddleware from './errorMiddleware';
import logger, { logRequest } from './logger';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';

const app = express();
const server = http.createServer(app);
const connectionPool = createConnectionPool();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logRequest);
app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorMiddleware);

const start = async () => {
    await connectionPool;
    monitorMemoryUsage();
    server.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
    });
};

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await connectionPool.drain();
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
start();