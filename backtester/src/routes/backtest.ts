import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError, ServiceError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

const backtestRouter = Router();
const store = new InMemoryStore();

const sanitizeInput = (req, res, next) => {
    req.body = {
        strategyParams: req.body.strategyParams,
        historicalData: req.body.historicalData.map(data => ({
            timestamp: data.timestamp,
            price: data.price,
        }))
    };
    next();
};

backtestRouter.post('/', [
    body('strategyParams').exists().custom((value) => StrategyParametersSchema.safeParse(value).success).withMessage('Invalid strategy parameters.'),
    body('historicalData').isArray().notEmpty().withMessage('Historical data must be a non-empty array.').custom((value) => value.every(item => HistoricalDataSchema.safeParse(item).success)).withMessage('Each historical data entry must be valid.')
], sanitizeInput, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn({ message: 'Validation errors', errors: errors.array() });
            return next(new ValidationError('Validation errors: ' + JSON.stringify(errors.array())));
        }
        const { strategyParams, historicalData } = req.body;
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

backtestRouter.get('/', async (req, res, next) => {
    const { limit = 10, offset = 0, orderBy = 'createdAt', orderDirection = 'asc' } = req.query;
    try {
        const allResults = await store.findAll();
        const sortedResults = allResults.sort((a, b) => {
            if (orderDirection === 'asc') {
                return a[orderBy] > b[orderBy] ? 1 : -1;
            } else {
                return a[orderBy] < b[orderBy] ? 1 : -1;
            }
        });
        const paginatedResults = sortedResults.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedResults);
    } catch (error) {
        logger.error('Error retrieving backtest results:', error);
        next(new ServiceError('Error retrieving backtest results: ' + error.message));
    }
});

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

export { backtestRouter };