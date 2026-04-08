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

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();
const connectionPool = createConnectionPool();

// Security middleware setup
app.use(helmet());
app.use(cors({ origin: ['https://allowed-origin.com'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Rate limit middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });
    next();
});

const startApp = async () => {
    await migrateData([]);
    await seedData();
    logStartup(config);

    app.get('/prices', async (req, res, next) => {
        try {
            const prices = await priceAggregator.getCurrentPrices();
            if (Object.keys(prices).length === 0) {
                return res.status(204).send();
            }
            res.status(200).json(prices);
        } catch (error) {
            logError(error, 'Error fetching prices');
            next(error);
        }
    });

    app.post('/prices', validatePriceData, handleValidationErrors, async (req, res, next) => {
        try {
            const newPrice = await priceAggregator.addPrice(req.body);
            res.status(201).json(newPrice);
        } catch (error) {
            logError(error, 'Error adding price');
            next(error);
        }
    });

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
        const isReady = await priceAggregator.checkReady();
        if (isReady) {
            return res.status(200).json({ status: 'ready' });
        }
        res.status(503).json({ status: 'not ready' });
    });

    app.use(errorMiddleware);

    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        await connectionPool.drain();
        httpServer.close(() => {
            console.log('HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
        setInterval(() => memoryMonitor.logMemoryUsage(), 60000);
    });
};

startApp();
