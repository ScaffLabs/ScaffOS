import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { PriceAggregator } from './priceAggregator';
import http from 'http';
import errorMiddleware from './errorMiddleware';
import { config } from './config';
import { logRequest } from './logger';
import { validatePriceData, handleValidationErrors, validatePriceUpdate } from './middleware/validationMiddleware';

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

app.get('/prices', async (req, res, next) => {
    const { limit, offset } = req.query;
    try {
        const prices = await priceAggregator.getPrices({ limit: Number(limit) || 10, offset: Number(offset) || 0 });
        if (prices.length === 0) return res.status(204).send();
        res.status(200).json(prices);
    } catch (error) {
        next(error);
    }
});

app.post('/prices', validatePriceData, handleValidationErrors, async (req, res, next) => {
    try {
        const newPrice = await priceAggregator.addPrice(req.body);
        res.status(201).json(newPrice);
    } catch (error) {
        next(error);
    }
});

app.put('/prices/:id', validatePriceUpdate, handleValidationErrors, async (req, res, next) => {
    try {
        const updatedPrice = await priceAggregator.updatePrice(req.params.id, req.body);
        if (!updatedPrice) return res.status(404).send();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

app.delete('/prices/:id', async (req, res, next) => {
    try {
        await priceAggregator.deletePrice(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

app.use(errorMiddleware);

const startApp = async () => {
    httpServer.listen(config.port, () => {
        console.log(`Price aggregator service running on port ${config.port}`);
    });
};

startApp();
