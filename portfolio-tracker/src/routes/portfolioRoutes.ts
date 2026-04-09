import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio } from '../services/portfolioService';
import logger from '../services/logger';
import { ValidationError, NotFoundError } from '../errors';
import { auditLog } from '../services/auditService';
import rateLimit from 'express-rate-limit';

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

// Rate limiting middleware for portfolio routes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

router.use(limiter);

router.post('/', portfolioValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array(), requestId: req.headers['x-request-id'] });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await createPortfolio(req.body);
        await auditLog('Portfolio Created', portfolio);
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
        await auditLog('Portfolio Updated', { id: req.params.id, changes: req.body });
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
        await auditLog('Portfolio Deleted', { id: req.params.id });
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

export default router;