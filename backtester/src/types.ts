// Types and schemas for backtester service
import { z } from 'zod';

// Branded types for unique IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Historical data for backtesting.
 * @property {number} timestamp - The timestamp of the data point in seconds.
 * @property {number} price - The price of the asset at the given timestamp.
 */
export interface HistoricalData {
  timestamp: number;
  price: number;
}

/**
 * Parameters for the trading strategy.
 * @property {number} slippage - The allowable slippage in price when placing orders.
 * @property {number} buyThreshold - The threshold percentage for buying signals.
 * @property {number} sellThreshold - The threshold percentage for selling signals.
 */
export interface StrategyParameters {
  slippage: number;
  buyThreshold: number;
  sellThreshold: number;
}

/**
 * Result of the backtest simulation.
 * @property {number} totalReturns - The total returns from the backtest.
 * @property {number} trades - The number of trades executed.
 * @property {number} winRate - The percentage of profitable trades.
 * @property {string} performanceMetrics - A summary of the backtest performance.
 */
export interface BacktestResult {
  totalReturns: number;
  trades: number;
  winRate: number;
  performanceMetrics: string;
}

// Zod schemas for runtime validation
export const HistoricalDataSchema = z.object({
  timestamp: z.number().nonnegative(),
  price: z.number().positive(),
});

export const StrategyParametersSchema = z.object({
  slippage: z.number().nonnegative(),
  buyThreshold: z.number().min(0).max(1),
  sellThreshold: z.number().min(0).max(1),
});

export const BacktestResultSchema = z.object({
  totalReturns: z.number(),
  trades: z.number(),
  winRate: z.number().min(0).max(1),
  performanceMetrics: z.string(),
});

// Exporting schemas
export { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema };