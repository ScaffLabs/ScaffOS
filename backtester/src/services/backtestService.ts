import { HistoricalData, StrategyParameters, BacktestResult, BacktestId, BacktestResultSchema } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import InMemoryStore from '../storage/InMemoryStore';
import axios from 'axios';
import { withRetry, circuitBreaker } from './resilience';
import { eventEmitter } from './resilience';

const store = new InMemoryStore<BacktestResult>();
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
const DATA_SERVICE_URL = process.env.DATA_SERVICE_URL;

/**
 * Fetch historical data from the data service.
 * @returns {Promise<HistoricalData[]>} An array of historical data entries.
 */
async function fetchHistoricalData(): Promise<HistoricalData[]> {
    return await withRetry(async () => {
        const response = await axios.get(`${DATA_SERVICE_URL}/api/historical-data`);
        return response.data;
    });
}

/**
 * Calculate total returns, number of trades, win rate, and performance metrics based on historical data.
 * @param {HistoricalData[]} historicalData - The historical data to analyze.
 * @param {number} buyThreshold - The threshold for buy conditions.
 * @param {number} sellThreshold - The threshold for sell conditions.
 * @param {number} slippage - The slippage percentage.
 * @returns {Promise<{ totalReturns: number; trades: number; winRate: number; performanceMetrics: string; }>} The calculated results.
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
        // Buy Condition
        if (currentPrice > previousPrice * (1 + buyThreshold)) {
            trades++;
            totalReturns += (currentPrice * (1 - slippage)) - previousPrice;
            successfulTrades++;
        } 
        // Sell Condition
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
 * Simulate a backtest based on provided parameters and historical data.
 * @param {StrategyParameters} params - The strategy parameters.
 * @param {HistoricalData[]} historicalData - The historical data to use for the backtest.
 * @returns {Promise<BacktestResult>} The backtest result object containing id, totalReturns, trades, winRate, and performanceMetrics.
 */
const simulateBacktest = async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    const validation = StrategyParametersSchema.safeParse(params);
    if (!validation.success) {
        throw new ValidationError('Invalid strategy parameters: ' + validation.error.format());
    }
    const historicalDataFetched = await fetchHistoricalData();
    const dataToUse = historicalData.length ? historicalData : historicalDataFetched;
    const { totalReturns, trades, winRate, performanceMetrics } = await calculateReturns(dataToUse, params.buyThreshold, params.sellThreshold, params.slippage);
    const backtestId: BacktestId = uuidv4() as BacktestId;
    const result: BacktestResult = { id: backtestId, totalReturns, trades, winRate, performanceMetrics };
    logger.info({ message: 'Backtest simulation completed', params, totalReturns });
    await store.create(result);
    eventEmitter.emit('BACKTEST_CREATED', result); // Emit event
    return BacktestResultSchema.parse(result);
};

export { simulateBacktest };