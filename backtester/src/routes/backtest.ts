import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
import { ValidationError } from '../middleware/errorHandler';
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
    next(new Error('Error during backtest')); // Generic error for other exceptions
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
    next(error); // Pass error to error handler
  }
});

export { backtestRouter };