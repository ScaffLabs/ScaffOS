import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema } from '../types';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import sanitizer from 'express-sanitizer';

const backtestRouter = Router();
const store = new InMemoryStore();

backtestRouter.use(sanitizer());

backtestRouter.post('/', async (req, res, next) => {
    const { strategyParams, historicalData } = req.body;
    try {
        // Validate and sanitize input
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => HistoricalDataSchema.parse(data));

        const result = await simulateBacktest(strategyParams, historicalData);
        const entity = await store.create({ strategyParams, historicalData, result });
        res.status(201).json({ id: entity.id, result });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(error);
        }
        next(new ServiceError('Error during backtest')); // Handling unexpected errors
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
        next(error);
    }
});

backtestRouter.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { strategyParams, historicalData } = req.body;
    try {
        // Validate input
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => HistoricalDataSchema.parse(data));

        const result = await simulateBacktest(strategyParams, historicalData);
        const updatedEntity = await store.update(id, { strategyParams, historicalData, result });
        if (!updatedEntity) {
            throw new NotFoundError('Backtest result not found for update.');
        }
        res.status(200).json(updatedEntity);
    } catch (error) {
        next(error);
    }
});

backtestRouter.delete('/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const deleted = await store.delete(id);
        if (!deleted) {
            throw new NotFoundError('Backtest result not found for deletion.');
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

backtestRouter.get('/', async (req, res, next) => {
    const { limit = 10, offset = 0 } = req.query;
    try {
        const results = await store.findAll();
        const paginatedResults = results.slice(offset, offset + limit);
        res.status(200).json({ results: paginatedResults, total: results.length });
    } catch (error) {
        next(error);
    }
});

export { backtestRouter };