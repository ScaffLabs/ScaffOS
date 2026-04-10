import request from 'supertest';
import { createServer } from '../src/index';
import { simulateBacktest } from '../src/services/backtestService';
import { HistoricalData, StrategyParameters } from '../src/types';
import InMemoryStore from '../src/storage/InMemoryStore';

const app = createServer();
const store = new InMemoryStore();

jest.mock('../src/services/backtestService');

describe('Backtest API', () => {
    it('should perform a backtest successfully', async () => {
        const strategyParams: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
        const historicalData: HistoricalData[] = [
            { timestamp: 1620000000, price: 100 },
            { timestamp: 1620000060, price: 101 },
        ];

        (simulateBacktest as jest.Mock).mockResolvedValue({ totalReturns: 1, trades: 1, winRate: 100, performanceMetrics: 'Simulated 1 trades with a win rate of 100' });

        const response = await request(app)
            .post('/api/backtest')
            .send({ strategyParams, historicalData });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.result).toHaveProperty('totalReturns', 1);
        expect(response.body.result).toHaveProperty('trades', 1);
        expect(response.body.result).toHaveProperty('winRate', 100);
        expect(response.body.result).toHaveProperty('performanceMetrics', 'Simulated 1 trades with a win rate of 100');
    });

    it('should return 400 for invalid input', async () => {
        const response = await request(app)
            .post('/api/backtest')
            .send({}); // No body
        expect(response.status).toBe(400);
    });

    it('should handle edge cases with empty historical data', async () => {
        const strategyParams: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
        const response = await request(app)
            .post('/api/backtest')
            .send({ strategyParams, historicalData: [] });
        expect(response.status).toBe(400);
    });

    it('should return 404 for non-existing backtest result', async () => {
        const response = await request(app)
            .get('/api/backtest/non-existing-id');
        expect(response.status).toBe(404);
    });

    it('should return the correct backtest result', async () => {
        const strategyParams: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
        const historicalData: HistoricalData[] = [
            { timestamp: 1620000000, price: 100 },
            { timestamp: 1620000060, price: 101 },
        ];
        const mockResult = { totalReturns: 1, trades: 1, winRate: 100, performanceMetrics: 'Simulated 1 trades with a win rate of 100' };
        const entity = await store.create({ strategyParams, historicalData, result: mockResult });

        const response = await request(app)
            .get(`/api/backtest/${entity.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', entity.id);
        expect(response.body.result).toEqual(mockResult);
    });
});

describe('simulateBacktest function', () => {
    it('should return correct backtest results', async () => {
        const params: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
        const historicalData: HistoricalData[] = [
            { timestamp: 1620000000, price: 100 },
            { timestamp: 1620000060, price: 101 },
        ];

        const result = await simulateBacktest(params, historicalData);
        expect(result).toEqual({
            totalReturns: 1,
            trades: 1,
            winRate: 100,
            performanceMetrics: 'Simulated 1 trades with a win rate of 100'
        });
    });

    it('should handle edge cases with invalid historical data', async () => {
        const params: StrategyParameters = { slippage: 0.01, buyThreshold: 0.5, sellThreshold: 0.5 };
        await expect(simulateBacktest(params, [{ timestamp: 1620000000, price: -100 }])).rejects.toThrow('Price must be a positive number.');
    });
});
