import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios, deletePortfolio } from '../services/portfolioService';
import logger from '../services/logger';

const router = Router();

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

// Get a specific portfolio by ID
router.get('/:id', [
    param('id').isString().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await getPortfolio(req.params.id);
        res.json(portfolio);
    } catch (error) {
        logger.error('Portfolio not found', { error: error.message });
        res.status(404).json({ error: error.message });
    }
});

// Update an existing portfolio
router.put('/:id', [
    param('id').isString().trim().escape(),
    body('name').optional().isString().notEmpty().trim().escape(),
    body('positions').optional().isArray()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        res.json(updatedPortfolio);
    } catch (error) {
        logger.error('Error updating portfolio', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

// Delete a portfolio by ID
router.delete('/:id', [
    param('id').isString().trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const deleted = await deletePortfolio(req.params.id);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Portfolio not found' });
        }
    } catch (error) {
        logger.error('Error deleting portfolio', { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

// Fetch all portfolios with pagination and sorting
router.get('/', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('sort').optional().isIn(['name', 'createdAt']),
    query('order').optional().isIn(['asc', 'desc'])
], async (req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const sort = req.query.sort || 'name';
    const order = req.query.order || 'asc';
    try {
        const portfolios = await fetchPortfolios({ limit, offset, sort, order });
        res.json(portfolios);
    } catch (error) {
        logger.error('Error fetching portfolios', { error: error.message });
        res.status(503).json({ error: 'Service unavailable' });
    }
});

export default router; 