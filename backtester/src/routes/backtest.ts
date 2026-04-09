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
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            HistoricalDataSchema.parse(data);
        });
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
    const { limit, offset, sort, order } = req.query;
    try {
        const paginationParams = PaginationSchema.parse({ limit, offset, sort, order });
        const results = await store.findAll();
        const sortedResults = results.sort((a, b) => {
            if (paginationParams.order === 'asc') {
                return a.data[paginationParams.sort] > b.data[paginationParams.sort] ? 1 : -1;
            } else {
                return a.data[paginationParams.sort] < b.data[paginationParams.sort] ? 1 : -1;
            }
        });
        const paginatedResults = sortedResults.slice(paginationParams.offset, paginationParams.offset + paginationParams.limit);
        res.status(200).json(paginatedResults);
    } catch (error) {
        next(new ServiceError('Error fetching backtest results: ' + error.message));
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