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

// Update price
router.put('/prices/:exchange', validatePriceData, handleValidationErrors, async (req, res) => {
    const priceData = req.body;
    const { exchange } = req.params;
    try {
        const updatedPrice = await priceAggregator.updatePrice(exchange, priceData);
        if (!updatedPrice) return res.status(404).json({ error: 'Price not found' });
        res.status(200).json(updatedPrice);
    } catch (error) {
        console.error(error);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Error updating price' });
        }
    }
});

// Delete price
router.delete('/prices/:exchange', async (req, res) => {
    const { exchange } = req.params;
    try {
        const deleted = await priceAggregator.deletePrice(exchange);
        if (!deleted) return res.status(404).json({ error: 'Price not found' });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting price' });
    }
});

export default router;