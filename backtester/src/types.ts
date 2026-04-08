// Types and Schemas for Backtester Service
import { z } from 'zod';

/**
 * A unique identifier for an order.
 * @example 'b1f46e61-7a1e-4b4d-bcb2-5b3b7f3e3ab8'
 */
export type OrderId = string;

/**
 * A unique identifier for a trade.
 * @example 'd2e8e7c5-9cdf-4e2e-bb94-1f3e8f1b9b0d'
 */
export type TradeId = string;

/**
 * Represents historical market data for backtesting.
 */
export interface HistoricalData {
    timestamp: number; // Unix timestamp in seconds.
    price: number; // Price at the given timestamp.
}

/**
 * Strategy parameters for the backtest simulation.
 */
export interface StrategyParameters {
    slippage: number; // Slippage percentage as a decimal.
    buyThreshold: number; // Threshold for buying as a decimal between 0 and 1.
    sellThreshold: number; // Threshold for selling as a decimal between 0 and 1.
}

/**
 * Result of a backtest simulation.
 */
export interface BacktestResult {
    totalReturns: number; // Total returns from the backtest.
    trades: number; // Total number of trades executed.
    winRate: number; // Win rate as a percentage.
    performanceMetrics: string; // Summary of performance metrics.
}

/**
 * Zod schema for validating historical data.
 */
export const HistoricalDataSchema = z.object({
    timestamp: z.number().nonnegative(),
    price: z.number().positive(),
});

/**
 * Zod schema for validating strategy parameters.
 */
export const StrategyParametersSchema = z.object({
    slippage: z.number().nonnegative(),
    buyThreshold: z.number().min(0).max(1),
    sellThreshold: z.number().min(0).max(1),
});

/**
 * Zod schema for validating backtest results.
 */
export const BacktestResultSchema = z.object({
    totalReturns: z.number(),
    trades: z.number().int().nonnegative(),
    winRate: z.number().min(0).max(100),
    performanceMetrics: z.string(),
});

/**
 * Zod schema for pagination parameters.
 */
export const PaginationSchema = z.object({
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).default(0),
    sort: z.string().default('createdAt'),
    order: z.enum(['asc', 'desc']).default('asc'),
});

export { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema, PaginationSchema };