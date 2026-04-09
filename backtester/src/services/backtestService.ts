import { HistoricalData, StrategyParameters, BacktestResult, BacktestId } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
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

        if (typeof currentPrice !== 'number' || currentPrice <= 0) {
            throw new ValidationError('Price must be a positive number.');
        }

        if (currentPrice > previousPrice * (1 + buyThreshold)) {
            trades++;
            totalReturns += (currentPrice * (1 - slippage)) - previousPrice;
        } else if (currentPrice < previousPrice * (1 - sellThreshold)) {
            trades++;
            totalReturns += previousPrice - (currentPrice * (1 + slippage));
        }
    }

    const winRate = trades > 0 ? (totalReturns > 0 ? (trades / (trades * 2)) * 100 : 0) : 0;
    const performanceMetrics = `Simulated ${trades} trades with a win rate of ${winRate}%`;
    return { totalReturns, trades, winRate, performanceMetrics };
}

const simulateBacktest = async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    const validation = StrategyParametersSchema.safeParse(params);
    if (!validation.success) {
        throw new ValidationError('Invalid strategy parameters: ' + validation.error.format());
    }

    const { totalReturns, trades, winRate, performanceMetrics } = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
    const backtestId: BacktestId = uuidv4() as BacktestId;
    const result: BacktestResult = { id: backtestId, totalReturns, trades, winRate, performanceMetrics };
    logger.info({ message: 'Backtest simulation completed', params, totalReturns });
    return result;
};

export { simulateBacktest };