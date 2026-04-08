import express from 'express';
import { migrateData, seedData } from './migration';
import { PriceAggregator } from './priceAggregator';
import { MemoryMonitor } from './memoryMonitor';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logRequest, logError } from './logger';
import { ServiceError } from './errors';
import csrf from 'csurf';
import { validatePriceData, handleValidationErrors } from './middleware/validationMiddleware';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(cors({ origin: ['https://allowed-origin.com'] }));
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
const csrfProtection = csrf();
app.use(csrfProtection);

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

    app.get('/health', async (req, res, next) => {
        try {
            const health = await priceAggregator.checkDependencies();
            res.status(200).json({ status: 'healthy', dependencies: health });
        } catch (error) {
            logError(error, 'Health check failed');
            next(new ServiceError('Health check failed.'));
        }
    });

    app.get('/prices', async (req, res, next) => {
        const { limit = 10, offset = 0, sort = 'price', order = 'asc' } = req.query;
        try {
            const prices = await priceAggregator.getCurrentPrices();
            const sortedPrices = Object.entries(prices)
                .sort(([, a], [, b]) => (order === 'asc' ? a - b : b - a))
                .slice(offset, offset + limit);
            res.status(200).json(sortedPrices);
        } catch (error) {
            logError(error, 'Failed to fetch current prices');
            next(new ServiceError('Failed to fetch current prices.'));
        }
    });

    app.post('/prices', validatePriceData, handleValidationErrors, async (req, res, next) => {
        try {
            const newPriceData = req.body;
            const createdPrice = await priceAggregator.addPrice(newPriceData);
            res.status(201).json(createdPrice);
        } catch (error) {
            logError(error, 'Failed to add price');
            next(error);
        }
    });

    app.put('/prices/:id', validatePriceData, handleValidationErrors, async (req, res, next) => {
        const { id } = req.params;
        const updatedData = req.body;
        try {
            const updatedPrice = await priceAggregator.updatePrice(id, updatedData);
            if (!updatedPrice) {
                return res.status(404).json({ error: 'Price not found' });
            }
            res.status(200).json(updatedPrice);
        } catch (error) {
            logError(error, 'Failed to update price');
            next(error);
        }
    });

    app.delete('/prices/:id', async (req, res, next) => {
        const { id } = req.params;
        try {
            await priceAggregator.deletePrice(id);
            res.status(204).send();
        } catch (error) {
            logError(error, 'Failed to delete price');
            next(error);
        }
    });

    app.use(errorMiddleware);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
    });

    process.on('SIGTERM', async () => {
        console.log('SIGTERM signal received: closing HTTP server');
        httpServer.close((err) => {
            if (err) {
                console.error('Error during server shutdown:', err);
            }
            console.log('HTTP server closed');
            process.exit(0);
        });
    });

    setInterval(() => {
        memoryMonitor.logMemoryUsage();
    }, 60000);
};

startApp();