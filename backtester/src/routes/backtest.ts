import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { healthCheckServices } from '../services/healthCheckService';
import { StrategyParametersSchema, HistoricalDataSchema } from '../types';
import { ValidationError } from '../middleware/errorHandler';

const backtestRouter = Router();

backtestRouter.post('/', async (req, res, next) => {
  const { strategyParams, historicalData } = req.body;
  try {
    StrategyParametersSchema.parse(strategyParams);
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
      throw new ValidationError('historicalData must be a non-empty array.');
    }
    historicalData.forEach(data => HistoricalDataSchema.parse(data));

    const result = await simulateBacktest(strategyParams, historicalData);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(error);
    }
    next(new Error('Error during backtest'));
  }
});

backtestRouter.get('/health', async (req, res, next) => {
  try {
    const healthResults = await healthCheckServices();
    res.status(200).json({ health: healthResults });
  } catch (error) {
    next(new Error('Health check failed'));
  }
});

export { backtestRouter };