import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import { setReady } from './healthCheck';
import logger from './logger';
import { RiskPositionStorage, seedData, runMigrations } from './migrations';
import { createPool } from 'mysql2/promise';
import MemoryQueue from './memoryQueue';

const app = express();
const server = http.createServer(app);
const storage = new RiskPositionStorage();
const dbPool = createPool({
    host: 'localhost',
    user: 'root',
    database: 'risk_manager',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const initializeDatabase = async () => {
    await runMigrations(storage);
};

const startServer = async () => {
    await initializeDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        setReady(true);
    });
};

app.use(express.json());
app.use('/api', apiRouter);
app.use('/health', healthRouter);

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

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});
