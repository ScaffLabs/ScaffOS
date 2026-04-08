import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import axios from 'axios';
import { EventEmitter } from 'events';
import logger from '../utils/logger';
import { ServiceError } from '../middleware/errorHandler';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TIMEOUT = 5000; // 5 seconds timeout
const eventEmitter = new EventEmitter();

async function fetchDataFromService(url: string, retries: number = MAX_RETRIES): Promise<any> {
    try {
        const response = await axios.get(url, { timeout: TIMEOUT });
        return response.data;
    } catch (error) {
        if (retries > 0) {
            logger.warn(`Retrying ${url}, attempts left: ${retries}`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchDataFromService(url, retries - 1);
        }
        logger.error(`Failed to fetch from ${url}: ${error.message}`);
        throw new ServiceError('Service unavailable');
    }
}

async function fetchOrders() {
    const url = process.env.ORDER_SERVICE_URL + '/api/orders';
    return await fetchDataFromService(url);
}

async function fetchHistoricalData() {
    const url = process.env.DATA_SERVICE_URL + '/api/historical-data';
    return await fetchDataFromService(url);
}

export async function simulateBacktest(params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> {
    if (!params || !historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
        throw new ServiceError('Invalid input: Parameters and historicalData must be provided and historicalData cannot be empty.');
    }

    const orders = await fetchOrders();

    let totalReturns = 0;
    let trades = 0;
    let wins = 0;

    for (const currentData of historicalData) {
        const order = orders.find(o => o.timestamp === currentData.timestamp);
        if (order) {
            const entryPrice = currentData.price;
            const slippageAdjustedPrice = entryPrice * (1 + params.slippage);
            const shouldBuy = entryPrice <= slippageAdjustedPrice * (1 - params.buyThreshold);
            const shouldSell = entryPrice >= slippageAdjustedPrice * (1 + params.sellThreshold);

            if (shouldBuy) {
                trades++;
                totalReturns -= entryPrice; // Cost of buying
            } else if (shouldSell) {
                trades++;
                totalReturns += entryPrice; // Revenue from selling
                wins++;
            }
        }
    }

    const winRate = trades > 0 ? (wins / trades) * 100 : 0;
    return {
        totalReturns,
        trades,
        winRate,
        performanceMetrics: `Simulated ${trades} trades with a win rate of ${winRate.toFixed(2)}%`
    };
}

export function emitBacktestComplete(result: BacktestResult) {
    eventEmitter.emit('backtestComplete', result);
}

export { eventEmitter };