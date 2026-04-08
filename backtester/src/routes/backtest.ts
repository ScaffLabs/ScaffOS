import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema, PaginationSchema } from '../types';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';

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
            if (typeof data.timestamp !== 'number' || typeof data.price !== 'number') {
                throw new ValidationError('Each historical data entry must have a numeric timestamp and price.');
            }
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

backtestRouter.get('/', async (req, res, next) => {
    const { limit, offset, sort, order } = req.query;
    try {
        const pagination = PaginationSchema.parse({ limit, offset, sort, order });
        const results = await store.findAll();
        const sortedResults = results.sort((a, b) => {
            const aValue = a.data[pagination.sort];
            const bValue = b.data[pagination.sort];
            return pagination.order === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
        });
        const paginatedResults = sortedResults.slice(pagination.offset, pagination.offset + pagination.limit);
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
            return next(error);
        }
        next(new ServiceError('Error retrieving backtest result: ' + error.message));
    }
});

export { backtestRouter };