import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors, validateContentType } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { logRequest, logError } from './logger';
import { ValidationError, NotFoundError, ServiceError } from './errors';

const router = express.Router();
const priceAggregator = new PriceAggregator();

router.use(cors());
router.use(helmet());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});
router.use(limiter);

router.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });
    next();
});

router.get('/prices', async (req, res, next) => {
    const { limit = 10, offset = 0, sort = 'asc', exchange } = req.query;
    try {
        const prices = await priceAggregator.getCurrentPrices({
            limit: Number(limit),
            offset: Number(offset),
            sort,
            exchange: exchange ? String(exchange) : undefined
        });
        if (!prices.length) return res.status(204).send();
        res.status(200).json(prices);
    } catch (error) {
        logError(error, { message: 'Fetching prices failed' });
        next(new ServiceError('Failed to fetch prices.')); // Enhanced error handling
    }
});

router.post('/prices', validateContentType, validatePriceData, handleValidationErrors, async (req, res, next) => {
    try {
        const newPrice = await priceAggregator.addPrice(req.body);
        res.status(201).json(newPrice);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        logError(error, { message: 'Adding price failed' });
        next(new ServiceError('Failed to add price.')); // Enhanced error handling
    }
});

router.delete('/prices/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        await priceAggregator.deletePrice(id);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        logError(error, { message: 'Deleting price failed' });
        next(new ServiceError('Failed to delete price.')); // Enhanced error handling
    }
});

export default router;