import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
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

export { backtestRouter };