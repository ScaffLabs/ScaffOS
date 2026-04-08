import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import healthRouter from './routes/health';
import config from './config';
import Database from './storage/Database';
import http from 'http';
import errorHandler from './middleware/errorHandler';
import { logRequest, logSuccess } from './middleware/logger';
import rateLimiter from './middleware/rateLimiter';
import { healthCheck, readinessCheck } from './services/HealthService';
import { createServer } from 'http';
import { CircuitBreaker } from 'opossum';
import { EventEmitter } from 'events';
import os from 'os';

dotenv.config();
const app = express();
const server = createServer(app);
const db = new Database();
const eventBus = new EventEmitter();

// Circuit breaker for health checks
const healthCircuitBreaker = new CircuitBreaker(healthCheck, {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

app.use(helmet());
app.use(cors());
app.use(rateLimiter);
app.use(bodyParser.json());
app.use(logRequest);
app.use('/api/health', healthRouter);
app.use(errorHandler);

app.get('/health', async (req, res) => {
    try {
        const result = await healthCircuitBreaker.fire();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

app.get('/ready', async (req, res) => {
    try {
        const status = await readinessCheck();
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ error: 'Readiness check failed' });
    }
});

const startServer = async () => {
    await db.connect(config.databaseUrl);
    logSuccess(`Database connected: ${config.databaseUrl}`);
    server.listen(config.port, () => {
        logSuccess(`Server running on http://localhost:${config.port}`);
    });
};

startServer();

const shutdown = async () => {
    logSuccess('Shutting down gracefully...');
    await db.closeConnection();
    server.close(() => {
        logSuccess('Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const monitorMemoryUsage = () => {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        logSuccess(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
    }, 60000); // Log memory usage every minute
};
monitorMemoryUsage();