import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import axios from 'axios';
import { logger } from '../utils/logger';
import { withRetry, circuitBreaker } from './resilience';

async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number): Promise<number> {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
        throw new ValidationError('Historical data must be a non-empty array.');
    }
    let totalReturns = 0;
    let trades = 0;

    for (let i = 1; i < historicalData.length; i++) {
        const previousPrice = historicalData[i - 1].price;
        const currentPrice = historicalData[i].price;

        if (currentPrice <= 0) throw new ValidationError('Price must be positive.');

        if (currentPrice > previousPrice * (1 + buyThreshold)) { // Buy Condition
            trades++;
            totalReturns += currentPrice * (1 - slippage) - previousPrice; // Calculate profit after slippage
        } else if (currentPrice < previousPrice * (1 - sellThreshold)) { // Sell Condition
            trades++;
            totalReturns += previousPrice * (1 - slippage) - currentPrice; // Calculate profit after slippage
        }
    }

    return totalReturns;
}

const simulateBacktest = circuitBreaker(async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    try {
        const totalReturns = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
        const trades = historicalData.length; // Total trades simulated
        const winRate = trades > 0 ? (totalReturns > 0 ? 100 : 0) : 0; // Simple win rate calculation
        const performanceMetrics = `Simulated ${trades} trades with ${winRate}% win rate`;

        logger.info({ message: 'Backtest simulation completed', params, totalReturns });
        return { totalReturns, trades, winRate, performanceMetrics };
    } catch (error) {
        logger.error({ message: 'Backtest simulation error', error: error.message });
        throw new ServiceError('An error occurred during backtesting: ' + error.message);
    }
}, 3, { totalReturns: 0, trades: 0, winRate: 0, performanceMetrics: 'No trades simulated' });

export { simulateBacktest };