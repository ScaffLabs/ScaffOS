import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { PriceAggregator } from './priceAggregator';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest, logError, logStartup } from './logger';

const app = express();
const httpServer = http.createServer(app);
const priceAggregator = new PriceAggregator();

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
    const start = process.hrtime();
    res.on('finish', () => {
        const duration = process.hrtime(start);
        logRequest(req, res, duration[0] * 1000 + duration[1] / 1e6);
    });
    next();
});

app.get('/prices', async (req, res, next) => {
    const { limit, offset } = req.query;
    try {
        const prices = await priceAggregator.getCurrentPrices();
        if (prices.length === 0) return res.status(204).send();
        res.status(200).json(prices);
    } catch (error) {
        logError(error, { method: req.method, path: req.path });
        next(error);
    }
});

app.post('/prices', async (req, res, next) => {
    try {
        const newPrice = await priceAggregator.addPrice(req.body);
        res.status(201).json(newPrice);
    } catch (error) {
        logError(error, { method: req.method, path: req.path });
        next(error);
    }
});

app.use(errorMiddleware);

const startApp = async () => {
    logStartup(config);
    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
    });
};

startApp();
