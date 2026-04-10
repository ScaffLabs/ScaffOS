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

const allowedOrigins = ['https://example.com', 'https://another-domain.com'];
router.use(cors({ origin: allowedOrigins }));
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
    const { limit = 10, offset = 0, sort = 'asc', exchange } = req.query;
    try {
        const prices = await priceAggregator.getCurrentPrices({ limit: Number(limit), offset: Number(offset), sort, exchange });
        if (prices.length === 0) {
            return res.status(204).send();
        }
        res.status(200).json(prices);
    } catch (error) {
        logError(error, { message: 'Fetching prices failed' });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error fetching prices' });
    }
});

router.post('/prices', validateContentType, validatePriceData, handleValidationErrors, async (req, res) => {
    const priceData = req.body;
    try {
        const newPrice = await priceAggregator.addPrice(priceData);
        res.status(201).json(newPrice);
    } catch (error) {
        logError(error, { message: 'Adding price failed' });
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error adding price' });
        }
    }
});

router.delete('/prices/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await priceAggregator.deletePrice(id);
        res.status(204).send();
    } catch (error) {
        logError(error, { message: 'Deleting price failed' });
        res.status(500).json({ error: 'Error deleting price' });
    }
});

export default router;