import { HistoricalData, StrategyParameters, BacktestResult, BacktestId, BacktestResultSchema } from '../types';
import { ServiceError, ValidationError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { withRetry } from './resilience';
import InMemoryStore from '../storage/InMemoryStore';

const store = new InMemoryStore<BacktestResult>();

const orderServiceUrl = process.env.ORDER_SERVICE_URL;
const dataServiceUrl = process.env.DATA_SERVICE_URL;

async function fetchOrders() {
    return withRetry(async () => {
        const response = await axios.get(`${orderServiceUrl}/api/orders`);
        return response.data;
    });
}

async function fetchHistoricalData() {
    return withRetry(async () => {
        const response = await axios.get(`${dataServiceUrl}/api/historical-data`);
        return response.data;
    });
}

async function calculateReturns(historicalData: HistoricalData[], buyThreshold: number, sellThreshold: number, slippage: number) {
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
        if (currentPrice > previousPrice * (1 + buyThreshold)) {
            trades++;
            totalReturns += (currentPrice * (1 - slippage)) - previousPrice;
            successfulTrades++;
        } else if (currentPrice < previousPrice * (1 - sellThreshold)) {
            trades++;
            totalReturns += previousPrice - (currentPrice * (1 + slippage));
            successfulTrades++;
        }
    }
    const winRate = trades > 0 ? (successfulTrades / trades) * 100 : 0;
    const performanceMetrics = `Simulated ${trades} trades with a win rate of ${winRate.toFixed(2)}%`;
    return { totalReturns, trades, winRate, performanceMetrics };
}

const simulateBacktest = async (params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> => {
    const validation = StrategyParametersSchema.safeParse(params);
    if (!validation.success) {
        throw new ValidationError('Invalid strategy parameters: ' + validation.error.format());
    }
    const historicalDataFetched = await fetchHistoricalData();
    const { totalReturns, trades, winRate, performanceMetrics } = await calculateReturns(historicalDataFetched, params.buyThreshold, params.sellThreshold, params.slippage);
    const backtestId: BacktestId = uuidv4() as BacktestId;
    const result: BacktestResult = { id: backtestId, totalReturns, trades, winRate, performanceMetrics };
    logger.info({ message: 'Backtest simulation completed', params, totalReturns });
    await store.create(result);
    return BacktestResultSchema.parse(result);
};

export { simulateBacktest, fetchOrders, fetchHistoricalData };