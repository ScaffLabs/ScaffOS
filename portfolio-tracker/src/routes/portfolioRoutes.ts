import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios, deletePortfolio, healthCheckPortfolioService } from '../services/portfolioService';
import logger from '../services/logger';

const router = Router();

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const healthStatus = await healthCheckPortfolioService();
        res.json(healthStatus);
    } catch (error) {
        logger.error('Health check failed', { error: error.message });
        res.status(503).json({ status: 'DOWN', error: error.message });
    }
});

// Create a new portfolio
router.post('/', [
    body('name').isString().notEmpty().trim().escape(),
    body('positions').isArray().optional()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await createPortfolio(req.body);
        res.status(201).json(portfolio);
    } catch (error) {
        logger.error('Error creating portfolio', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

// Other routes remain unchanged...

export default router;