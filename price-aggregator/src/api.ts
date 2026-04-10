import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { logRequest } from './logger';
import { checkHealth } from './httpClient';

const router = express.Router();
const priceAggregator = new PriceAggregator();

// CORS configuration
const allowedOrigins = ['https://example.com', 'https://another-domain.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware for security headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
});
router.use(limiter);

// Log requests
router.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req, res, duration);
    });
    next();
});

// Health endpoint
router.get('/health', async (req, res) => {
    try {
        const healthCheck = await checkHealth();
        res.status(200).json({ status: 'healthy', dependencies: healthCheck });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

// Get current prices with pagination
router.get('/prices', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const cursor = req.query.cursor as string || null;

    try {
        const prices = await priceAggregator.getCurrentPrices();
        const paginatedPrices = Object.entries(prices).slice(offset, offset + limit);
        res.status(200).json(paginatedPrices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching prices' });
    }
});

// Add new price
router.post('/prices', validatePriceData, handleValidationErrors, async (req, res) => {
    const priceData = req.body;
    try {
        const newPrice = await priceAggregator.addPrice(priceData);
        res.status(201).json(newPrice);
    } catch (error) {
        console.error(error);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error adding price' });
        }
    }
});

export default router;