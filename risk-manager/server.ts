import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import logger from './logger';
import { errorHandler } from './errors';
import MemoryQueue from './memoryQueue';
import { createPool } from 'mysql2/promise';
import gracefulShutdown from './gracefulShutdown';
import setHealth from './healthCheck';

const app = express();
const server = http.createServer(app);

// MySQL connection pooling
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
app.use(errorHandler);

const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
};

// Health check interval
setInterval(async () => {
    const healthStatus = await dbPool.query('SELECT 1');
    if (healthStatus[0].length === 0) {
        logger.warn('Health check failed!');
    }
}, 60000);

// Graceful Shutdown
process.on('SIGTERM', async () => await gracefulShutdown(dbPool));
process.on('SIGINT', async () => await gracefulShutdown(dbPool));

startServer();
