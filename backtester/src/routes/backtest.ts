import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError, ServiceError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
import { body, validationResult, query } from 'express-validator';

const backtestRouter = Router();
const store = new InMemoryStore();

// Create a backtest
backtestRouter.post('/', [
    body('strategyParams').exists().custom((value) => StrategyParametersSchema.safeParse(value).success).withMessage('Invalid strategy parameters.'),
    body('historicalData').isArray().notEmpty().withMessage('Historical data must be a non-empty array.').custom((value) => value.every(item => HistoricalDataSchema.safeParse(item).success)).withMessage('Each historical data entry must be valid.')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn({ message: 'Validation errors', errors: errors.array() });
        return next(new ValidationError('Validation errors: ' + JSON.stringify(errors.array())));
    }
    const { strategyParams, historicalData } = req.body;
    try {
        const result = await simulateBacktest(strategyParams, historicalData);
        const entity = await store.create({ strategyParams, historicalData, result });
        logger.info({ message: 'Backtest created', id: entity.id });
        res.status(201).json({ id: entity.id, result });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.warn({ message: 'Validation error', error: error.message });
            return next(error);
        }
        next(new ServiceError('Error during backtest: ' + error.message));
    }
});

// Get a backtest result by ID
backtestRouter.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await store.read(id);
        if (!result) {
            throw new NotFoundError('Backtest result not found.');
        }
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn({ message: 'Not found error for ID', id });
            return next(error);
        }
        next(new ServiceError('Error retrieving backtest result: ' + error.message));
    }
});

// List backtests with pagination, filtering, and sorting
backtestRouter.get('/', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer.'),
    query('sortBy').optional().isString().withMessage('SortBy must be a string.').isIn(['totalReturns', 'trades', 'winRate']).withMessage('SortBy must be one of the allowed fields.')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn({ message: 'Validation errors', errors: errors.array() });
        return next(new ValidationError('Validation errors: ' + JSON.stringify(errors.array())));
    }
    const { limit = 10, offset = 0, sortBy = 'totalReturns' } = req.query;
    try {
        const allBacktests = await store.findAll();
        const sortedBacktests = allBacktests.sort((a, b) => b.data[sortBy] - a.data[sortBy]);
        const paginatedBacktests = sortedBacktests.slice(offset, offset + limit);
        res.status(200).json(paginatedBacktests);
    } catch (error) {
        next(new ServiceError('Error retrieving backtests: ' + error.message));
    }
});

// Update a backtest result by ID
backtestRouter.put('/:id', [
    body('strategyParams').optional().custom((value) => StrategyParametersSchema.safeParse(value).success).withMessage('Invalid strategy parameters.'),
    body('historicalData').optional().isArray().custom((value) => value.every(item => HistoricalDataSchema.safeParse(item).success)).withMessage('Each historical data entry must be valid.')
], async (req, res, next) => {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn({ message: 'Validation errors', errors: errors.array() });
        return next(new ValidationError('Validation errors: ' + JSON.stringify(errors.array())));
    }
    const updates = req.body;
    try {
        const updatedEntity = await store.update(id, updates);
        if (!updatedEntity) {
            throw new NotFoundError('Backtest result not found.');
        }
        res.status(200).json(updatedEntity);
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn({ message: 'Not found error for ID', id });
            return next(error);
        }
        next(new ServiceError('Error updating backtest result: ' + error.message));
    }
});

// Delete a backtest result by ID
backtestRouter.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const deleted = await store.delete(id);
        if (!deleted) {
            throw new NotFoundError('Backtest result not found.');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            logger.warn({ message: 'Not found error for ID', id });
            return next(error);
        }
        next(new ServiceError('Error deleting backtest result: ' + error.message));
    }
});

export { backtestRouter };