import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError, ServiceError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
import { body, validationResult } from 'express-validator';

const backtestRouter = Router();
const store = new InMemoryStore();

backtestRouter.post('/', [
    body('strategyParams').exists().custom((value) => StrategyParametersSchema.safeParse(value).success),
    body('historicalData').isArray().notEmpty().custom((value) => value.every(item => HistoricalDataSchema.safeParse(item).success)),
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn({ message: 'Validation errors', errors: errors.array() });
        return res.status(400).json({ errors: errors.array() });
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