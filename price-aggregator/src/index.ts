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
import { logRequest, logError, logStartup } from './logger';
import { ServiceError } from './errors';
import csrf from 'csurf';
import { validatePriceData, handleValidationErrors } from './middleware/validationMiddleware';
import { query } from 'express-validator';

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
    logStartup(config);
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

    app.get('/prices', [
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('offset').optional().isInt({ min: 0 }).toInt(),
        query('sort').optional().isIn(['asc', 'desc']),
        query('filter').optional().isString().escape(),
    ], async (req, res, next) => {
        try {
            const { limit, offset, sort, filter } = req.query;
            const prices = await priceAggregator.getCurrentPrices({ limit, offset, sort, filter });
            res.status(200).json(prices);
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
        try {
            const { id } = req.params;
            const updatedPriceData = req.body;
            const updatedPrice = await priceAggregator.updatePrice(id, updatedPriceData);
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
        try {
            const { id } = req.params;
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

    const shutdown = async () => {
        console.log('Shutting down gracefully...');
        httpServer.close((err) => {
            if (err) {
                logError(err, 'Error during server shutdown');
            }
            console.log('HTTP server closed');
            process.exit(0);
        });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    setInterval(() => {
        memoryMonitor.logMemoryUsage();
    }, 60000);
};

startApp();