import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios } from '../services/portfolioService';
import logger from '../services/logger';

const router = Router();

router.post('/', [
    body('name').isString().notEmpty().trim().escape(),
    body('positions').isArray().optional()
], async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const startTime = Date.now();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await createPortfolio(req.body);
        const duration = Date.now() - startTime;
        logger.info('Portfolio created', { portfolio, duration, requestId });
        res.status(201).json(portfolio);
    } catch (error) {
        logger.error('Error creating portfolio', { error: error.message, requestId });
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id', [
    param('id').isString().trim().escape()
], async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const startTime = Date.now();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await getPortfolio(req.params.id);
        const duration = Date.now() - startTime;
        logger.info('Portfolio retrieved', { portfolio, duration, requestId });
        res.json(portfolio);
    } catch (error) {
        logger.error('Portfolio not found', { error: error.message, id: req.params.id, requestId });
        res.status(404).json({ error: error.message });
    }
});

router.put('/:id', [
    param('id').isString().trim().escape(),
    body('name').optional().isString().notEmpty().trim().escape(),
    body('positions').optional().isArray()
], async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    const startTime = Date.now();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        const duration = Date.now() - startTime;
        logger.info('Portfolio updated', { updatedPortfolio, duration, requestId });
        res.json(updatedPortfolio);
    } catch (error) {
        logger.error('Error updating portfolio', { error: error.message, requestId });
        res.status(400).json({ error: error.message });
    }
});

router.get('/', async (req, res) => {
    const requestId = req.headers['x-request-id'] || 'unknown';
    logger.info('Fetching all portfolios', { requestId });
    try {
        const portfolios = await fetchPortfolios();
        res.json(portfolios);
    } catch (error) {
        logger.error('Service unavailable', { error: error.message, requestId });
        res.status(503).json({ error: 'Service unavailable' });
    }
});

export default router;
