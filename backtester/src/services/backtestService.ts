import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import axios from 'axios';
import { EventEmitter } from 'events';
import logger from '../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const eventEmitter = new EventEmitter();

async function fetchDataFromService(url: string, retries: number = MAX_RETRIES): Promise<any> {
  try {
    const start = Date.now();
    const response = await axios.get(url);
    const duration = Date.now() - start;
    logger.debug(`Fetched data from ${url} in ${duration}ms`);
    return response.data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchDataFromService(url, retries - 1);
    }
    logger.error(`Failed to fetch from ${url}: ${error.message}`);
    throw error;
  }
}

async function fetchOrders() {
  const ordersUrl = `${process.env.ORDER_SERVICE_URL}/orders`;
  try {
    const orders = await fetchDataFromService(ordersUrl);
    return orders;
  } catch (error) {
    eventEmitter.emit('error', { service: 'Order Service', error });
    throw new Error('Failed to fetch orders');
  }
}

async function fetchHistoricalData() {
  const dataUrl = `${process.env.DATA_SERVICE_URL}/historical-data`;
  try {
    const historicalData = await fetchDataFromService(dataUrl);
    return historicalData;
  } catch (error) {
    eventEmitter.emit('error', { service: 'Data Service', error });
    throw new Error('Failed to fetch historical data');
  }
}

export async function simulateBacktest(params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> {
  const [orders, historicalDataResponse] = await Promise.all([
    fetchOrders(),
    fetchHistoricalData()
  ]);

  let totalReturns = 0;
  let trades = 0;
  let wins = 0;

  for (let i = 0; i < historicalData.length; i++) {
    const currentData = historicalData[i];
    const order = orders.find(o => o.timestamp === currentData.timestamp);

    if (order) {
      const entryPrice = currentData.price;
      const slippageAdjustedPrice = entryPrice * (1 + params.slippage);
      const shouldBuy = entryPrice <= slippageAdjustedPrice * (1 - params.buyThreshold);
      const shouldSell = entryPrice >= slippageAdjustedPrice * (1 + params.sellThreshold);

      if (shouldBuy) {
        trades++;
        totalReturns -= entryPrice;
      } else if (shouldSell) {
        trades++;
        totalReturns += entryPrice;
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
