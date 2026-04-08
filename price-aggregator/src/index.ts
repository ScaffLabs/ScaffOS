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
import { validatePriceData, handleValidationErrors, validatePriceUpdate } from './middleware/validationMiddleware';
import { ValidationError, ServiceError } from './errors';

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

app.use(errorMiddleware);

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