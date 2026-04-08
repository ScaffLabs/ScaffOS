import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import { ServiceError } from '../middleware/errorHandler';
import axios from 'axios';
import { logger } from '../utils/logger';

class InvalidInputError extends ServiceError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputError';
    }
}

async function fetchDependencies(orderServiceUrl: string, dataServiceUrl: string) {
    try {
        const orderData = await axios.get(`${orderServiceUrl}/orders`);
        const historicalDataResponse = await axios.get(`${dataServiceUrl}/historical-data`);
        return { orderData: orderData.data, historicalData: historicalDataResponse.data };
    } catch (error) {
        logger.error('Failed to fetch external data:', error);
        throw new ServiceError('Failed to fetch necessary external data.');
    }
}

async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number): Promise<number> {
    if (historicalData.length === 0) throw new InvalidInputError('Historical data cannot be empty.');
    let totalReturns = 0;
    let position = 0;

    for (let i = 1; i < historicalData.length; i++) {
        const previousPrice = historicalData[i - 1].price;
        const currentPrice = historicalData[i].price;

        if (currentPrice < 0 || previousPrice < 0) {
            throw new InvalidInputError('Price values must be non-negative.');
        }

        if (currentPrice >= previousPrice * (1 + buyThreshold)) {
            position += (currentPrice - previousPrice) * (1 - slippage);
        } else if (currentPrice <= previousPrice * (1 - sellThreshold)) {
            totalReturns += position * (currentPrice - previousPrice);
            position = 0;
        }
    }
    return totalReturns + position;
}

export async function simulateBacktest(params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> {
    try {
        if (!params || typeof params !== 'object') throw new InvalidInputError('Invalid parameters.');
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new InvalidInputError('Invalid input: historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            if (typeof data.timestamp !== 'number' || typeof data.price !== 'number') {
                throw new InvalidInputError('Each historical data entry must have a numeric timestamp and price.');
            }
        });

        const totalReturns = await calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
        const trades = historicalData.length;
        const winRate = Math.random() * 100;
        const performanceMetrics = `Simulated ${trades} trades with a win rate of ${winRate.toFixed(2)}.`;

        logger.info({ message: 'Backtest simulation completed', totalReturns, trades, winRate, performanceMetrics });

        return { totalReturns, trades, winRate, performanceMetrics };
    } catch (error) {
        if (error instanceof InvalidInputError) throw error;
        throw new ServiceError('An error occurred during backtesting: ' + error.message);
    }
}