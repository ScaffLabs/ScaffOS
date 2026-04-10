import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import csrf from 'csurf';
import { sanitize } from '../middleware/sanitization';
import { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio, fetchAllData } from '../services/portfolioService';
import logger from '../services/logger';
import { ValidationError, NotFoundError } from '../errors';
import { auditLog } from '../services/auditService';

const router = Router();

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'https://your-allowed-origin.com'];
router.use(cors({ origin: allowedOrigins, optionsSuccessStatus: 200 }));

// CSRF protection
const csrfProtection = csrf({ cookie: true });
router.use(csrfProtection);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
});
router.use(limiter);

// Middleware for sanitization
router.use(sanitize);

// Validation rules for portfolio creation and updates
const portfolioValidation = [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('positions').isArray().optional().custom((positions) => {
        if (!positions || positions.length === 0) {
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

router.get('/', async (req, res) => {
    const { limit = 10, offset = 0 } = req.query;
    try {
        const portfolios = await fetchAllData();
        const paginatedPortfolios = portfolios.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedPortfolios);
    } catch (error) {
        logger.error('Error fetching portfolios', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/', portfolioValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const portfolio = await createPortfolio(req.body);
        await auditLog('Portfolio Created', portfolio);
        logger.info('Portfolio created', { portfolioId: portfolio.id });
        res.status(201).json(portfolio);
    } catch (error) {
        logger.error('Error creating portfolio', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio(req.params.id);
        logger.info('Portfolio retrieved', { portfolioId: req.params.id });
        res.status(200).json(portfolio);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn('Portfolio not found', { portfolioId: req.params.id });
            return res.status(404).json({ error: error.message });
        }
        logger.error('Error retrieving portfolio', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:id', portfolioValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors', { errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        await auditLog('Portfolio Updated', { id: req.params.id, changes: req.body });
        logger.info('Portfolio updated', { portfolioId: req.params.id });
        res.status(200).json(updatedPortfolio);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn('Portfolio not found for update', { portfolioId: req.params.id });
            return res.status(404).json({ error: error.message });
        }
        logger.error('Error updating portfolio', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await deletePortfolio(req.params.id);
        await auditLog('Portfolio Deleted', { id: req.params.id });
        logger.info('Portfolio deleted', { portfolioId: req.params.id });
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn('Portfolio not found for deletion', { portfolioId: req.params.id });
            return res.status(404).json({ error: error.message });
        }
        logger.error('Error deleting portfolio', { error: error.message });
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;