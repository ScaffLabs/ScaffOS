import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError, ServiceError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema, PaginationSchema } from '../types';

const backtestRouter = Router();
const store = new InMemoryStore();

backtestRouter.post('/', async (req, res, next) => {
    const { strategyParams, historicalData } = req.body;
    try {
        // Validate and sanitize strategy parameters
        StrategyParametersSchema.parse(strategyParams);
        // Validate historical data
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            HistoricalDataSchema.parse(data);
        });

        const sanitizedHistoricalData = historicalData.map(data => req.sanitize(data));

        const result = await simulateBacktest(strategyParams, sanitizedHistoricalData);
        const entity = await store.create({ strategyParams, historicalData: sanitizedHistoricalData, result });
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

backtestRouter.get('/', async (req, res, next) => {
    const { limit, offset, sort, order } = PaginationSchema.parse(req.query);
    try {
        const results = await store.findAll();
        const sortedResults = results.sort((a, b) => {
            return order === 'asc' ? a.data.createdAt - b.data.createdAt : b.data.createdAt - a.data.createdAt;
        });
        const paginatedResults = sortedResults.slice(offset, offset + limit);
        res.status(200).json(paginatedResults);
    } catch (error) {
        next(new ServiceError('Error retrieving backtest results: ' + error.message));
    }
});

export { backtestRouter };