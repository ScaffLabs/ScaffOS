import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { healthCheckServices, eventEmitter } from '../services/healthCheckService';
import { StrategyParametersSchema, HistoricalDataSchema } from '../types';
import { ValidationError } from '../middleware/errorHandler';

const backtestRouter = Router();

backtestRouter.post('/', async (req, res, next) => {
  const { strategyParams, historicalData } = req.body;
  try {
    // Validate input data
    StrategyParametersSchema.parse(strategyParams);
    historicalData.forEach(data => HistoricalDataSchema.parse(data));

    const result = await simulateBacktest(strategyParams, historicalData);
    res.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(error);
    }
    next(new Error('Error during backtest')); // Generic error handling
  }
});

backtestRouter.get('/health', async (req, res) => {
  const healthResults = await healthCheckServices();
  res.json({ health: healthResults });
});

export { backtestRouter };