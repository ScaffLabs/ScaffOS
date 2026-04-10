import { HistoricalData, StrategyParameters, BacktestResult, BacktestId, BacktestResultSchema } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { withRetry } from './resilience';
import InMemoryStore from '../storage/InMemoryStore';

const store = new InMemoryStore<BacktestResult>();

/**
 * Calculates the returns based on historical data and strategy parameters.
 * @param historicalData - The historical price data used for backtesting.
 * @param buyThreshold - The threshold at which to buy.
 * @param sellThreshold - The threshold at which to sell.
 * @param slippage - The slippage percentage.
 * @returns An object containing the total returns, number of trades, win rate, and performance metrics.
 */
async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number): Promise<{ totalReturns: number; trades: number; winRate: number; performanceMetrics: string; }> {
    if (!Array.isArray(historicalData) || historicalData.length === 0) {
        throw new ValidationError('Historical data must be a non-empty array.');
    }
    let totalReturns = 0;
    let trades = 0;
    let successfulTrades = 0;

    for (let i = 1; i < historicalData.length; i++) {
        const previousPrice = historicalData[i - 1].price;
        const currentPrice = historicalData[i].price;

        if (typeof currentPrice !== 'number' || currentPrice <= 0) {
            throw new ValidationError('Price must be a positive number.');
        }

        // Buy logic
        if (currentPrice > previousPrice * (1 + buyThreshold)) {
            trades++;
            totalReturns += (currentPrice * (1 - slippage)) - previousPrice;
            successfulTrades++;
        } 
        // Sell logic
        else if (currentPrice < previousPrice * (1 - sellThreshold)) {
            trades++;
            totalReturns += previousPrice - (currentPrice * (1 + slippage));
            successfulTrades++;
        }
    }

    const winRate = trades > 0 ? (successfulTrades / trades) * 100 : 0;
    const performanceMetrics = `Simulated ${trades} trades with a win rate of ${winRate.toFixed(2)}%`;
    return { totalReturns, trades, winRate, performanceMetrics };
}

/**
 * Simulates a backtest using the provided strategy parameters and historical data.
 * @param params - The strategy parameters for the backtest.
 * @param historicalData - The historical price data used for backtesting.
 * @returns The result of the backtest simulation.
 */
const simulateBacktest = async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    const validation = StrategyParametersSchema.safeParse(params);
    if (!validation.success) {
        throw new ValidationError('Invalid strategy parameters: ' + validation.error.format());
    }

    const { totalReturns, trades, winRate, performanceMetrics } = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
    const backtestId: BacktestId = uuidv4() as BacktestId;
    const result: BacktestResult = { id: backtestId, totalReturns, trades, winRate, performanceMetrics };
    logger.info({ message: 'Backtest simulation completed', params, totalReturns });

    // Store the result in memory for retrieval
    await store.create(result);
    return BacktestResultSchema.parse(result);
};

export { simulateBacktest };