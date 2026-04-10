import express from 'express';
import { PriceAggregator } from './priceAggregator';
import { validatePriceData, handleValidationErrors } from './middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const priceAggregator = new PriceAggregator();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // limit each IP to 100 requests per windowMs
});

// Health endpoint
router.get('/health', async (req, res) => {
    try {
        const health = await priceAggregator.checkDependencies();
        res.status(200).json({ status: 'healthy', dependencies: health });
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
        const prices = await priceAggregator.getCurrentPrices(); // Implement pagination in PriceAggregator
        const paginatedPrices = Object.entries(prices).slice(offset, offset + limit);
        res.status(200).json(paginatedPrices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching prices' });
    }
});

// Add new price
router.post('/prices', limiter, validatePriceData, handleValidationErrors, async (req, res) => {
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

// Update price (PUT)
router.put('/prices/:id', async (req, res) => {
    const priceId = req.params.id;
    const priceData = req.body;
    try {
        const updatedPrice = await priceAggregator.updatePrice(priceId, priceData); // Implement update function
        if (!updatedPrice) {
            return res.status(404).json({ error: 'Price not found' });
        }
        res.status(200).json(updatedPrice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating price' });
    }
});

// Delete price
router.delete('/prices/:id', async (req, res) => {
    const priceId = req.params.id;
    try {
        await priceAggregator.deletePrice(priceId); // Implement delete function
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting price' });
    }
});

export default router;