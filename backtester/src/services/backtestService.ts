import { HistoricalData, StrategyParameters, BacktestResult, BacktestId } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import axios from 'axios';
import { logger } from '../utils/logger';
import { withRetry, circuitBreaker } from './resilience';
import { v4 as uuidv4 } from 'uuid';

async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number): Promise<{ totalReturns: number; trades: number; winRate: number; performanceMetrics: string; }> {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
        throw new ValidationError('Historical data must be a non-empty array.');
    }
    let totalReturns = 0;
    let trades = 0;

    for (let i = 1; i < historicalData.length; i++) {
        const previousPrice = historicalData[i - 1].price;
        const currentPrice = historicalData[i].price;

        // Buy Condition
        if (currentPrice > previousPrice * (1 + buyThreshold)) {
            trades++;
            totalReturns += (currentPrice * (1 - slippage)) - previousPrice;
        } 
        // Sell Condition
        else if (currentPrice < previousPrice * (1 - sellThreshold)) {
            trades++;
            totalReturns += previousPrice - (currentPrice * (1 + slippage));
        }
    }

    const winRate = trades > 0 ? (totalReturns > 0 ? (trades / (trades * 2)) * 100 : 0) : 0;
    const performanceMetrics = `Simulated ${trades} trades with a win rate of ${winRate}%`;
    return { totalReturns, trades, winRate, performanceMetrics };
}

const simulateBacktest = circuitBreaker(async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    try {
        const { totalReturns, trades, winRate, performanceMetrics } = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
        const backtestId: BacktestId = uuidv4() as BacktestId;
        const result: BacktestResult = { id: backtestId, totalReturns, trades, winRate, performanceMetrics };
        if (trades > 0) {
            await withRetry(() => axios.post(`${process.env.ORDER_SERVICE_URL}/orders`, { trades }));
            await withRetry(() => axios.post(`${process.env.DATA_SERVICE_URL}/data-update`, { totalReturns }));
        }
        logger.info({ message: 'Backtest simulation completed', params, totalReturns });
        return result;
    } catch (error) {
        logger.error({ message: 'Backtest simulation error', error: error.message });
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new ServiceError('An error occurred during backtesting: ' + error.message);
    }
}, 3, { totalReturns: 0, trades: 0, winRate: 0, performanceMetrics: 'No trades simulated' });

export { simulateBacktest };