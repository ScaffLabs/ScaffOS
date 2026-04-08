import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest, logError, logStartup } from './logger';
import { MemoryMonitor } from './memoryMonitor';
import { createConnectionPool } from './dbConnection';
import { validatePriceData, handleValidationErrors } from './middleware/validationMiddleware';
import { ValidationError, ServiceError } from './errors';
import { performance } from 'perf_hooks';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();
const connectionPool = createConnectionPool();

app.use(helmet());
app.use(cors({ origin: ['https://allowed-origin.com'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.get('/health', async (req, res, next) => {
    try {
        const health = await priceAggregator.checkDependencies();
        res.status(200).json({ status: 'healthy', dependencies: health });
    } catch (error) {
        logError(error, 'Health check failed');
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/ready', async (req, res) => {
    // Check readiness logic, e.g., DB connection check
    res.status(200).json({ status: 'ready' });
});

app.use(errorMiddleware);

let shutdownInitiated = false;

const gracefulShutdown = async () => {
    if (shutdownInitiated) return;
    shutdownInitiated = true;
    console.log('Shutting down gracefully...');
    await connectionPool.drain();
    httpServer.close();
    console.log('Closed all connections.');
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const startApp = async () => {
    await migrateData([]);
    await seedData();
    logStartup(config);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
        setInterval(() => memoryMonitor.logMemoryUsage(), 60000);
    });
};

startApp();