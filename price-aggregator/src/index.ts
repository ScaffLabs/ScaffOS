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
import { body, query, validationResult } from 'express-validator';
import { logRequest } from './logger';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();
const memoryMonitor = new MemoryMonitor();

app.use(cors({ origin: ['https://allowed-origin.com'] }));
app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

const startApp = async () => {
    await migrateData([]);
    await seedData();

    app.get('/health', async (req, res) => {
        try {
            const health = await priceAggregator.checkDependencies();
            res.status(200).json({ status: 'healthy', dependencies: health });
        } catch (error) {
            next(error);
        }
    });

    app.get('/prices', async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const prices = await priceAggregator.getCurrentPrices();
            if (Object.keys(prices).length === 0) return res.status(204).send();
            res.status(200).json(prices);
        } catch (error) {
            next(error);
        }
    });

    app.post('/prices', [
        body('exchange').isString().notEmpty(),
        body('price').isFloat({ gt: 0 }),
        body('volume').isFloat({ gt: 0 }),
    ], async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const newPriceData = req.body;
            const createdPrice = await priceAggregator.addPrice(newPriceData);
            res.status(201).json(createdPrice);
        } catch (error) {
            next(error);
        }
    });

    app.use(errorMiddleware);

    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
    });

    setInterval(() => {
        memoryMonitor.logMemoryUsage();
    }, 60000);
};

startApp();