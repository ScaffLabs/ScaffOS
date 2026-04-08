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

app.use(helmet());
app.use(cors({ origin: ['https://allowed-origin.com'], credentials: true }));
app.use(express.json({ limit: '1mb' }));

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
        const { limit = 10, offset = 0, sortBy = 'price', order = 'asc' } = req.query;
        try {
            const prices = await priceAggregator.getCurrentPrices();
            // Apply sorting and pagination
            const sortedPrices = Object.entries(prices).sort((a, b) => {
                const aValue = a[1];
                const bValue = b[1];
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }).slice(offset, offset + limit);
            if (sortedPrices.length === 0) {
                return res.status(204).send();
            }
            const response = Object.fromEntries(sortedPrices);
            response.VWAP = prices.VWAP; // Include VWAP in the response
            res.status(200).json(response);
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

    app.use(errorMiddleware);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
        setInterval(() => memoryMonitor.logMemoryUsage(), 60000);
    });
};

startApp();