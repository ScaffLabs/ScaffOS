import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';
import { HistoricalDataSchema, StrategyParametersSchema, PaginationSchema } from '../types';

const backtestRouter = Router();
const store = new InMemoryStore();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: 'Too many requests from this IP, please try again later.',
});

backtestRouter.use(limiter);

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
        res.status(201).json({ id: entity.id, result });
    } catch (error) {
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
        if (error instanceof NotFoundError) {
            return next(error);
        }
        next(new ServiceError('Error retrieving backtest result: ' + error.message));
    }
});

backtestRouter.get('/', async (req, res, next) => {
    const { limit, offset, sort, order } = req.query;
    try {
        const paginationParams = PaginationSchema.parse({ limit, offset, sort, order });
        const results = await store.findAll();
        const sortedResults = results.sort((a, b) => {
            if (paginationParams.order === 'asc') {
                return a.data[paginationParams.sort] - b.data[paginationParams.sort];
            }
            return b.data[paginationParams.sort] - a.data[paginationParams.sort];
        });
        const paginatedResults = sortedResults.slice(paginationParams.offset, paginationParams.offset + paginationParams.limit);
        res.status(200).json({ results: paginatedResults, total: sortedResults.length });
    } catch (error) {
        next(new ServiceError('Error fetching backtest results: ' + error.message));
    }
});

backtestRouter.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { strategyParams, historicalData } = req.body;
    try {
        const entity = await store.read(id);
        if (!entity) {
            throw new NotFoundError('Backtest result not found.');
        }
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            HistoricalDataSchema.parse(data);
        });
        const updatedEntity = await store.update(id, { strategyParams, historicalData });
        res.status(200).json(updatedEntity);
    } catch (error) {
        if (error instanceof NotFoundError) return next(error);
        next(new ServiceError('Error updating backtest result: ' + error.message));
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
        if (error instanceof NotFoundError) return next(error);
        next(new ServiceError('Error deleting backtest result: ' + error.message));
    }
});

export { backtestRouter };