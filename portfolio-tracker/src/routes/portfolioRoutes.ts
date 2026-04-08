import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createPortfolio, getPortfolio, updatePortfolio, fetchPortfolios, deletePortfolio } from '../services/portfolioService';
import logger from '../services/logger';
import { ValidationError } from '../errors';

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
        logger.info('Portfolio created', { portfolioId: portfolio.id, requestId: req.headers['x-request-id'] });
        res.status(201).json(portfolio);
    } catch (error) {
        logger.error('Error creating portfolio', { error: error.message, requestId: req.headers['x-request-id'] });
        res.status(400).json({ error: error.message });
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
        res.status(404).json({ error: error.message });
    }
});

// Additional endpoints (PUT, DELETE, GET all) would be similarly updated with validation and logging.