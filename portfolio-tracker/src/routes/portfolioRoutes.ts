import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios, deletePortfolio } from '../services/portfolioService';
import logger from '../services/logger';
import { ValidationError, NotFoundError } from '../errors';
import { logPortfolioCreation, logPortfolioUpdate, logPortfolioDeletion } from '../services/auditService';

const router = Router();

const portfolioValidation = [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('positions').isArray().optional().custom((positions) => {
        if (positions && positions.length === 0) {
            throw new ValidationError('Positions array cannot be empty.');
        }
        positions.forEach(pos => {
            if (!pos.symbol || typeof pos.quantity !== 'number' || pos.quantity < 0 || typeof pos.averagePrice !== 'number' || pos.averagePrice < 0) {
                throw new ValidationError('Invalid position data. Ensure symbol is provided and quantities are non-negative.');
            }
        });
        return true;
    })
];

router.post('/', portfolioValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId: req.headers['x-request-id'] });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await createPortfolio(req.body);
        await logPortfolioCreation(portfolio);
        logger.info('Portfolio created', { portfolioId: portfolio.id, requestId: req.headers['x-request-id'] });
        res.status(201).json(portfolio);
    } catch (error) {
        logger.error('Error creating portfolio', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', [param('id').isString().trim().escape()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId: req.headers['x-request-id'] });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await getPortfolio(req.params.id);
        logger.info('Fetched portfolio', { portfolioId: req.params.id, requestId: req.headers['x-request-id'] });
        res.status(200).json(portfolio);
    } catch (error) {
        logger.error('Error fetching portfolio', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', portfolioValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId: req.headers['x-request-id'] });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        await logPortfolioUpdate(req.params.id, req.body);
        logger.info('Portfolio updated', { portfolioId: req.params.id, requestId: req.headers['x-request-id'] });
        res.status(200).json(updatedPortfolio);
    } catch (error) {
        logger.error('Error updating portfolio', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', [param('id').isString().trim().escape()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId: req.headers['x-request-id'] });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        await deletePortfolio(req.params.id);
        await logPortfolioDeletion(req.params.id);
        logger.info('Portfolio deleted', { portfolioId: req.params.id, requestId: req.headers['x-request-id'] });
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting portfolio', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/', [
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('sort').optional().isIn(['name']).default('name'),
    query('order').optional().isIn(['asc', 'desc']).default('asc')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId: req.headers['x-request-id'] });
        return res.status(400).json({ errors: errors.array() });
    }

    const { limit = 10, offset = 0, sort = 'name', order = 'asc' } = req.query;
    try {
        const portfolios = await fetchPortfolios({ limit, offset, sort, order });
        res.status(200).json(portfolios);
    } catch (error) {
        logger.error('Error fetching portfolios', { error: error.message, requestId: req.headers['x-request-id'] });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;