// portfolioRoutes.ts
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { sanitize } from '../middleware/sanitization';
import { createPortfolio, getPortfolio, updatePortfolio, deletePortfolio, fetchAllData } from '../services/portfolioService';
import logger from '../services/logger';
import { ValidationError, NotFoundError } from '../errors';
import requestLogger from '../middleware/requestLogger';
import auditLogger from '../middleware/auditLogger';
import csrfProtection from '../middleware/csrfProtection';
import env from '../config';
import errorHandler from '../middleware/errorHandler';

const router = Router();

// Middleware
router.use(cors());
router.use(sanitize);
router.use(requestLogger);
router.use(auditLogger);
router.use(csrfProtection);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
router.use(limiter);

// Validation schema
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
    }),
];

// Utility function for pagination and filtering
const paginateAndFilter = (portfolios, limit, offset) => {
    return portfolios.slice(offset, offset + limit);
};

// Routes
router.post('/', portfolioValidation, async (req, res, next) => {
    try {
        const portfolio = await createPortfolio(req.body);
        logger.info('Portfolio created', { portfolioId: portfolio.id });
        res.status(201).json(portfolio);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const portfolio = await getPortfolio(req.params.id);
        res.json(portfolio);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', portfolioValidation, async (req, res, next) => {
    try {
        const updatedPortfolio = await updatePortfolio(req.params.id, req.body);
        res.json(updatedPortfolio);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        await deletePortfolio(req.params.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const { limit = 10, offset = 0, sort = 'name', order = 'asc' } = req.query;
        let portfolios = await fetchAllData();
        // Filtering logic can be added here
        portfolios = portfolios.sort((a, b) => {
            if (order === 'asc') return a[sort] > b[sort] ? 1 : -1;
            return a[sort] < b[sort] ? 1 : -1;
        });
        const paginatedPortfolios = paginateAndFilter(portfolios, Number(limit), Number(offset));
        res.json(paginatedPortfolios);
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
router.use(errorHandler);

export default router;