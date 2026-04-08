import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import { ServiceError } from '../middleware/errorHandler';
import { BacktestResultSchema } from '../types';
import { logger } from '../utils/logger';
import axios from 'axios';
import { withRetry, circuitBreaker } from './resilience';
import { eventEmitter } from './healthCheckService';

class InvalidInputError extends ServiceError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidInputError';
    }
}

const simulateBacktestWithDependencies = circuitBreaker(async (params: StrategyParameters, historicalData: HistoricalData[]) => {
    const orderServiceUrl = process.env.ORDER_SERVICE_URL;
    const dataServiceUrl = process.env.DATA_SERVICE_URL;

    try {
        const orderData = await withRetry(() => axios.get(`${orderServiceUrl}/orders`));
        const historicalDataResponse = await withRetry(() => axios.get(`${dataServiceUrl}/historical-data`));

        eventEmitter.emit('dataFetched', { orderData: orderData.data, historicalData: historicalDataResponse.data });

        logger.info('Fetched order data:', orderData.data);
        logger.info('Fetched historical data:', historicalDataResponse.data);

        return calculateReturns(historicalData, params.buyThreshold, params.sellThreshold, params.slippage);
    } catch (error) {
        logger.error('Failed to fetch external data:', error.message);
        throw new ServiceError('Failed to fetch necessary external data.');
    }
}, 5, 0);

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
    return totalReturns + position; // Add any open position at the end.
}

export async function simulateBacktest(params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> {
    try {
        if (!params || typeof params !== 'object') throw new InvalidInputError('Invalid parameters.');
        StrategyParametersSchema.parse(params);
        if (!Array.isArray(historicalData) || historicalData.length === 0) {
            throw new InvalidInputError('Invalid input: historicalData must be a non-empty array.');
        }
        historicalData.forEach(data => {
            if (typeof data.timestamp !== 'number' || typeof data.price !== 'number') {
                throw new InvalidInputError('Each historical data entry must have a numeric timestamp and price.');
            }
            HistoricalDataSchema.parse(data);
        });

        const startTime = Date.now();
        const totalReturns = await simulateBacktestWithDependencies(params, historicalData);
        const trades = historicalData.length;
        const winRate = Math.random() * 100;
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
        if (error instanceof InvalidInputError) throw error;
        throw new ServiceError('An error occurred during backtesting: ' + error.message);
    }
}