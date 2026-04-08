import request from 'supertest';
import { createServer } from '../src/index';
import { HistoricalData, StrategyParameters } from '../src/types';

const app = createServer();

describe('Backtest API', () => {
  it('should perform a backtest successfully', async () => {
    const strategyParams: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
    const historicalData: HistoricalData[] = [
      { timestamp: 1620000000, price: 100 },
      { timestamp: 1620000060, price: 101 },
    ];

    const response = await request(app)
      .post('/api/backtest')
      .send({ strategyParams, historicalData });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalReturns');
    expect(response.body).toHaveProperty('trades');
    expect(response.body).toHaveProperty('winRate');
    expect(response.body).toHaveProperty('performanceMetrics');
  });

  it('should return 500 on error', async () => {
    const response = await request(app)
      .post('/api/backtest')
      .send({}); // No body
    expect(response.status).toBe(500);
  });
});


describe('simulateBacktest function', () => {
  it('should return correct backtest results', () => {
    const params: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
    const historicalData: HistoricalData[] = [
      { timestamp: 1620000000, price: 100 },
      { timestamp: 1620000060, price: 101 },
    ];

    const result = simulateBacktest(params, historicalData);
    expect(result).toEqual({
      totalReturns: 0,
      trades: 0,
      winRate: 0,
      performanceMetrics: 'Simulated 0 trades with a win rate of 0'
    });
  });

  it('should handle edge cases with empty historical data', () => {
    const params: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
    const result = simulateBacktest(params, []);
    expect(result).toEqual({
      totalReturns: 0,
      trades: 0,
      winRate: 0,
      performanceMetrics: 'Simulated 0 trades with a win rate of 0'
    });
  });
});

