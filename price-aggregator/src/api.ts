import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors, validateContentType } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { logRequest, logError } from './logger';
import { checkHealth } from './httpClient';

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

router.get('/health', async (req, res) => {
    try {
        const healthCheck = await checkHealth();
        res.status(200).json({ status: 'healthy', dependencies: healthCheck });
    } catch (error) {
        logError(error, { message: 'Health check failed' });
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

router.get('/prices', async (req, res) => {
    try {
        const prices = await priceAggregator.getCurrentPrices();
        if (Object.keys(prices).length === 0) {
            return res.status(204).send();
        }
        res.status(200).json(prices);
    } catch (error) {
        logError(error, { message: 'Fetching prices failed' });
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

export default router;