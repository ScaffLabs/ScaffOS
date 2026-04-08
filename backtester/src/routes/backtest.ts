import { Router } from 'express';
import { simulateBacktest } from '../services/backtestService';
import { healthCheckServices, eventEmitter } from '../services/healthCheckService';
import { HistoricalData, StrategyParameters, BacktestResult } from '../types';

const backtestRouter = Router();

backtestRouter.post('/', async (req, res) => {
  const { strategyParams, historicalData }: { strategyParams: StrategyParameters; historicalData: HistoricalData[] } = req.body;
  try {
    const result: BacktestResult = await simulateBacktest(strategyParams, historicalData);
    res.json(result);
  } catch (error) {
    res.status(500).send('Error during backtest');
  }
});

backtestRouter.get('/health', async (req, res) => {
  const healthResults = await healthCheckServices();
  res.json({ health: healthResults });
});

eventEmitter.on('healthCheck', (data) => {
  console.log(`Health Check Event: Service ${data.service} is ${data.healthy ? 'healthy' : 'unhealthy'}`);
});

export { backtestRouter };