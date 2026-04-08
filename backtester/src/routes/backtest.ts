import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
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
        historicalData.forEach(data => HistoricalDataSchema.parse(data));

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
    const { limit = 10, offset = 0, sort = 'createdAt', order = 'asc' } = req.query;
    try {
        const results = await store.findAll(Number(limit), Number(offset), (entity) => entity.data);
        if (results.length === 0) {
            throw new NotFoundError('No backtest results found.');
        }
        const sortedResults = results.sort((a, b) => order === 'asc' ? a.data[sort] - b.data[sort] : b.data[sort] - a.data[sort]);
        res.status(200).json(sortedResults);
    } catch (error) {
        next(new ServiceError('Error retrieving backtest results: ' + error.message));
    }
});

backtestRouter.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const { strategyParams, historicalData } = req.body;
    try {
        const existing = await store.read(id);
        if (!existing) {
            throw new NotFoundError('Backtest result not found.');
        }
        StrategyParametersSchema.parse(strategyParams);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ValidationError('historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => HistoricalDataSchema.parse(data));

        const updatedResult = await simulateBacktest(strategyParams, historicalData);
        await store.update(id, { strategyParams, historicalData, result: updatedResult });
        res.status(204).send();
    } catch (error) {
        if (error instanceof ValidationError || error instanceof NotFoundError) {
            return next(error);
        }
        next(new ServiceError('Error updating backtest: ' + error.message));
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
            return next(error);
        }
        next(new ServiceError('Error deleting backtest: ' + error.message));
    }
});

export { backtestRouter };