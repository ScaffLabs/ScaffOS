import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import axios from 'axios';
import { logger } from '../utils/logger';
import { withRetry, circuitBreaker } from './resilience';

async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number): Promise<number> {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
        throw new ValidationError('Historical data must be a non-empty array.');
    }
    // Dummy implementation that simulates return calculation
    let totalReturns = 0; // Placeholder for actual calculations
    historicalData.forEach(data => {
        if (data.price <= 0) throw new ValidationError('Price must be positive.');
        totalReturns += data.price * (1 - slippage);
    });
    return totalReturns;
}

const simulateWithRetry = withRetry(async (params: StrategyParameters, historicalData: HistoricalData[]) => {
    return await simulateBacktest(params, historicalData);
});

export const simulateBacktest = circuitBreaker(async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    try {
        const totalReturns = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
        logger.info({ message: 'Backtest simulation completed', params, totalReturns });
        return { totalReturns, trades: historicalData.length, winRate: Math.random() * 100, performanceMetrics: 'Simulated trades' };
    } catch (error) {
        logger.error({ message: 'Backtest simulation error', error: error.message });
        throw new ServiceError('An error occurred during backtesting: ' + error.message);
    }
}, 3, { totalReturns: 0, trades: 0, winRate: 0, performanceMetrics: 'No trades simulated' });