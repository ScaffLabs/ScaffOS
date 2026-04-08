import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import { ServiceError } from '../middleware/errorHandler';
import { BacktestResultSchema } from '../types';
import { logger } from '../utils/logger';

async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number): Promise<number> {
    let totalReturns = 0;
    let position = 0;

    for (let i = 1; i < historicalData.length; i++) {
        const previousPrice = historicalData[i - 1].price;
        const currentPrice = historicalData[i].price;

        if (currentPrice >= previousPrice * (1 + buyThreshold)) {
            position += (currentPrice - previousPrice) * (1 - slippage);
        } else if (currentPrice <= previousPrice * (1 - sellThreshold)) {
            totalReturns += position * (currentPrice - previousPrice);
            position = 0;
        }
    }
    return totalReturns + position; // Add any open position at the end.
}

export async function simulateBacktest(params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> {
    try {
        if (!params || typeof params !== 'object') throw new ServiceError('Invalid parameters.');
        StrategyParametersSchema.parse(params);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new ServiceError('Invalid input: historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            if (typeof data.timestamp !== 'number' || typeof data.price !== 'number') {
                throw new ServiceError('Each historical data entry must have a numeric timestamp and price.');
            }
            HistoricalDataSchema.parse(data);
        });

        const startTime = Date.now();
        const totalReturns = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
        const trades = historicalData.length; // Simple count of trades based on historical data length.
        const winRate = Math.random() * 100; // Placeholder for actual win rate calculation.
        const performanceMetrics = `Simulated ${trades} trades with a win rate of ${winRate.toFixed(2)}.`;

        logger.info({
            message: 'Backtest simulation completed',
            duration: Date.now() - startTime,
            totalReturns,
            trades,
            winRate,
            performanceMetrics,
        });

        const result: BacktestResult = {
            totalReturns,
            trades,
            winRate,
            performanceMetrics,
        };

        BacktestResultSchema.parse(result);
        return result;
    } catch (error) {
        if (error instanceof ServiceError) throw error;
        throw new ServiceError('An error occurred during backtesting: ' + error.message);
    }
}