import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors, validateContentType } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { logRequest } from './logger';
import { checkHealth } from './httpClient';
import { postHttpClient } from './httpClient'; // Importing postHttpClient for event emission

const router = express.Router();
const priceAggregator = new PriceAggregator();

// CORS configuration
const allowedOrigins = ['https://example.com', 'https://another-domain.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware for security headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
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

// Get current prices
router.get('/prices', async (req, res) => {
    try {
        const prices = await priceAggregator.getCurrentPrices();
        if (Object.keys(prices).length === 0) {
            return res.status(204).send();
        }
        res.status(200).json(prices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching prices' });
    }
});

// Add new price
router.post('/prices', validateContentType, validatePriceData, handleValidationErrors, async (req, res) => {
    const priceData = req.body;
    try {
        const newPrice = await priceAggregator.addPrice(priceData);
        await postHttpClient('/event-bus/price-added', newPrice); // Emit price added event
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