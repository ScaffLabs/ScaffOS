import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors, validateContentType } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { logRequest, logError } from './logger';
import { ValidationError, NotFoundError } from './errors';

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

router.get('/prices', async (req, res) => {
    try {
        const prices = await priceAggregator.getCurrentPrices();
        if (!prices.length) return res.status(204).send();
        res.status(200).json(prices);
    } catch (error) {
        logError(error, { message: 'Fetching prices failed' });
        next(error);
    }
});

router.post('/prices', validateContentType, validatePriceData, handleValidationErrors, async (req, res, next) => {
    try {
        const newPrice = await priceAggregator.addPrice(req.body);
        res.status(201).json(newPrice);
    } catch (error) {
        logError(error, { message: 'Adding price failed' });
        next(error);
    }
});

export default router;