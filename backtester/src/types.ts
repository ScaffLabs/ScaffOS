// Types and schemas for backtester service
import { z } from 'zod';

// Branded types for unique IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Historical data for backtesting.
 * @property {number} timestamp - The timestamp of the data point in seconds. Must be a non-negative number.
 * @property {number} price - The price of the asset at the given timestamp. Must be a positive number.
 */
export interface HistoricalData {
  timestamp: number;
  price: number;
}

/**
 * Parameters for the trading strategy.
 * @property {number} slippage - The allowable slippage in price when placing orders. Must be a non-negative number.
 * @property {number} buyThreshold - The threshold percentage for buying signals. Must be between 0 and 1.
 * @property {number} sellThreshold - The threshold percentage for selling signals. Must be between 0 and 1.
 */
export interface StrategyParameters {
  slippage: number;
  buyThreshold: number;
  sellThreshold: number;
}

/**
 * Result of the backtest simulation.
 * @property {number} totalReturns - The total returns from the backtest. Can be positive or negative.
 * @property {number} trades - The number of trades executed. Must be a non-negative integer.
 * @property {number} winRate - The percentage of profitable trades. Must be between 0 and 100.
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
  timestamp: z.number().nonnegative(), // Validates that timestamp is a non-negative number
  price: z.number().positive(), // Validates that price is a positive number
});

export const StrategyParametersSchema = z.object({
  slippage: z.number().nonnegative(), // Validates that slippage is a non-negative number
  buyThreshold: z.number().min(0).max(1), // Validates that buyThreshold is between 0 and 1
  sellThreshold: z.number().min(0).max(1), // Validates that sellThreshold is between 0 and 1
});

export const BacktestResultSchema = z.object({
  totalReturns: z.number(), // Validates that totalReturns is a number
  trades: z.number().int().nonnegative(), // Validates that trades is a non-negative integer
  winRate: z.number().min(0).max(100), // Validates that winRate is between 0 and 100
  performanceMetrics: z.string(), // Validates that performanceMetrics is a string
});

// Exporting schemas
export { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema };