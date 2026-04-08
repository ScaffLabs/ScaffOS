import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { HistoricalDataSchema, StrategyParametersSchema } from '../types';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';
import InMemoryStore from '../storage/InMemoryStore';
import rateLimit from 'express-rate-limit';
import sanitizer from 'express-sanitizer';

const backtestRouter = Router();
const store = new InMemoryStore();

backtestRouter.use(sanitizer());

backtestRouter.post('/', async (req, res, next) => {
  const { strategyParams, historicalData } = req.body;
  try {
    // Sanitize input
    strategyParams.slippage = Number(req.sanitize(strategyParams.slippage));
    strategyParams.buyThreshold = Number(req.sanitize(strategyParams.buyThreshold));
    strategyParams.sellThreshold = Number(req.sanitize(strategyParams.sellThreshold));
    HistoricalDataSchema.parse(historicalData);

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
    next(new Error('Error during backtest'));
  }
});

backtestRouter.get('/', async (req, res, next) => {
  const { limit = 10, offset = 0 } = req.query;
  try {
    const results = await store.findAll();
    const paginatedResults = results.slice(Number(offset), Number(offset) + Number(limit));
    res.status(200).json(paginatedResults);
  } catch (error) {
    next(error);
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
    // Sanitize input
    StrategyParametersSchema.parse(strategyParams);
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      throw new ValidationError('historicalData must be a non-empty array.');
    }
    historicalData.forEach(data => HistoricalDataSchema.parse(data));

    const updatedEntity = await store.update(id, { strategyParams, historicalData });
    if (!updatedEntity) {
      throw new NotFoundError('Backtest result not found to update.');
    }
    res.status(200).json(updatedEntity);
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(error);
    }
    next(error);
  }
});

backtestRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleted = await store.delete(id);
    if (!deleted) {
      throw new NotFoundError('Backtest result not found to delete.');
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export { backtestRouter };