import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError, ServiceError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema } from '../types';
import { body, validationResult, query } from 'express-validator';

const backtestRouter = Router();
const store = new InMemoryStore();

backtestRouter.post('/', [
    body('strategyParams').exists().custom((value) => StrategyParametersSchema.safeParse(value).success).withMessage('Invalid strategy parameters.'),
    body('historicalData').isArray().notEmpty().withMessage('Historical data must be a non-empty array.').custom((value) => value.every(item => HistoricalDataSchema.safeParse(item).success)).withMessage('Each historical data entry must be valid.')
], async (req, res, next) => {
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
        logger.error({ message: 'Error during backtest', error: error.message });
        if (error instanceof ValidationError) {
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
        logger.error({ message: 'Error retrieving backtest result', error: error.message });
        if (error instanceof NotFoundError) {
            return next(error);
        }
        next(new ServiceError('Error retrieving backtest result: ' + error.message));
    }
});

export { backtestRouter };