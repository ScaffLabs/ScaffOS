import { HistoricalData, StrategyParameters, BacktestResult } from '../types';
import axios from 'axios';
import { EventEmitter } from 'events';
import { config } from '../../config';
import Bottleneck from 'bottleneck';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const eventEmitter = new EventEmitter();

const limiter = new Bottleneck({
  minTime: 200, // Minimum time between requests
  maxConcurrent: 5, // Maximum concurrent requests
});

async function fetchDataFromService(url: string, retries: number = MAX_RETRIES): Promise<any> {
  try {
    const response = await limiter.schedule(() => axios.get(url));
    return response.data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchDataFromService(url, retries - 1);
    }
    throw error;
  }
}

async function fetchOrders() {
  const ordersUrl = `${config.orderServiceUrl}/orders`;
  try {
    const orders = await fetchDataFromService(ordersUrl);
    return orders;
  } catch (error) {
    eventEmitter.emit('error', { service: 'Order Service', error });
    throw new Error('Failed to fetch orders');
  }
}

async function fetchHistoricalData() {
  const dataUrl = `${config.dataServiceUrl}/historical-data`;
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
        totalReturns -= entryPrice; // Cost of buying
      } else if (shouldSell) {
        trades++;
        totalReturns += entryPrice; // Proceeds from selling
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