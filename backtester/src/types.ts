// Types and schemas for backtester service
import { z } from 'zod';

/**
 * A unique identifier for an Order.
 * @type OrderId
 * @example 'order-1234'
 */
export type OrderId = string & { readonly brand: unique symbol };

/**
 * A unique identifier for a Trade.
 * @type TradeId
 * @example 'trade-5678'
 */
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Historical market data point.
 * @interface HistoricalData
 * @property {number} timestamp - Unix timestamp of the data point.
 * @property {number} price - Price at the given timestamp (must be positive).
 */
export interface HistoricalData {
    timestamp: number; // Unix timestamp of the data point
    price: number; // Price at the given timestamp
}

/**
 * Strategy parameters for backtesting.
 * @interface StrategyParameters
 * @property {number} slippage - Allowed slippage as a decimal (e.g., 0.01 for 1%).
 * @property {number} buyThreshold - Threshold for buying (0 to 1).
 * @property {number} sellThreshold - Threshold for selling (0 to 1).
 */
export interface StrategyParameters {
    slippage: number; // Allowed slippage as a decimal
    buyThreshold: number; // Threshold for buying
    sellThreshold: number; // Threshold for selling
}

/**
 * Result of a backtest execution.
 * @interface BacktestResult
 * @property {number} totalReturns - Total returns from the backtest.
 * @property {number} trades - Total number of trades executed.
 * @property {number} winRate - Win rate as a percentage.
 * @property {string} performanceMetrics - Summary of backtest performance.
 */
export interface BacktestResult {
    totalReturns: number; // Total returns from the backtest
    trades: number; // Total number of trades executed
    winRate: number; // Win rate as a percentage
    performanceMetrics: string; // Summary of backtest performance
}

export const HistoricalDataSchema = z.object({
    timestamp: z.number().nonnegative(), // Timestamp must be non-negative
    price: z.number().positive(), // Price must be positive
});

export const StrategyParametersSchema = z.object({
    slippage: z.number().nonnegative(), // Slippage must be non-negative
    buyThreshold: z.number().min(0).max(1), // Buy threshold must be between 0 and 1
    sellThreshold: z.number().min(0).max(1), // Sell threshold must be between 0 and 1
});

export const BacktestResultSchema = z.object({
    totalReturns: z.number(), // Total returns must be a number
    trades: z.number().int().nonnegative(), // Trades must be a non-negative integer
    winRate: z.number().min(0).max(100), // Win rate must be between 0 and 100
    performanceMetrics: z.string(), // Performance metrics must be a string
});

export { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema };