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
    throw new ServiceError('Service unavailable');
  }
}

export async function simulateBacktest(params: StrategyParameters, historicalData: HistoricalData[]): Promise<BacktestResult> {
  if (historicalData.length === 0) {
    throw new ValidationError('historicalData cannot be empty.');
  }

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