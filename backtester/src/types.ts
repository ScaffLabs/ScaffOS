// Types and Schemas for Backtester Service
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };
export type BacktestId = string & { readonly brand: unique symbol };

/**
 * Represents historical price data for backtesting.
 * @property {number} timestamp - The timestamp in seconds since the epoch, must be a positive integer.
 * @property {number} price - The price at the given timestamp, must be a positive number.
 */
export interface HistoricalData {
    timestamp: number;
    price: number;
}

/**
 * Represents the parameters for a trading strategy in backtesting.
 * @property {number} slippage - The slippage percentage (0 to 1).
 * @property {number} buyThreshold - The threshold for buying (0 to 1).
 * @property {number} sellThreshold - The threshold for selling (0 to 1).
 */
export interface StrategyParameters {
    slippage: number;
    buyThreshold: number;
    sellThreshold: number;
}

/**
 * Represents the result of a backtest.
 * @property {BacktestId} id - Unique identifier for the backtest result.
 * @property {number} totalReturns - The total returns from the backtest.
 * @property {number} trades - The number of trades executed during the backtest.
 * @property {number} winRate - The win rate percentage of the trades.
 * @property {string} performanceMetrics - A string summarizing performance metrics.
 */
export interface BacktestResult {
    id: BacktestId;
    totalReturns: number;
    trades: number;
    winRate: number;
    performanceMetrics: string;
}

export const HistoricalDataSchema = z.object({
    timestamp: z.number().int().positive().describe('Timestamp in seconds since the epoch, must be a positive integer.'),
    price: z.number().positive().describe('Price at the timestamp, must be a positive number.'),
});

export const StrategyParametersSchema = z.object({
    slippage: z.number().min(0).max(1).describe('Slippage percentage, must be between 0 and 1.'),
    buyThreshold: z.number().min(0).max(1).describe('Threshold for buying, must be between 0 and 1.'),
    sellThreshold: z.number().min(0).max(1).describe('Threshold for selling, must be between 0 and 1.'),
});

export const BacktestResultSchema = z.object({
    id: z.string().uuid().transform((id) => id as BacktestId),
    totalReturns: z.number(),
    trades: z.number().int().nonnegative(),
    winRate: z.number().min(0).max(100),
    performanceMetrics: z.string(),
});

export const BacktestEventSchema = z.union([
    z.object({ type: z.literal('BACKTEST_CREATED'), data: BacktestResultSchema }),
    z.object({ type: z.literal('BACKTEST_UPDATED'), data: BacktestResultSchema }),
    z.object({ type: z.literal('BACKTEST_ERROR'), message: z.string() }),
]);
