// Types and Schemas for Backtester Service
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };
export type BacktestId = string & { readonly brand: unique symbol };

export interface HistoricalData {
    timestamp: number; // Timestamp in seconds since the epoch, must be a positive integer.
    price: number; // Price at the timestamp, must be a positive number.
}

export interface StrategyParameters {
    slippage: number; // Slippage percentage, must be between 0 and 1.
    buyThreshold: number; // Threshold for buying, must be between 0 and 1.
    sellThreshold: number; // Threshold for selling, must be between 0 and 1.
}

export interface BacktestResult {
    id: BacktestId; // Unique identifier for the backtest result.
    totalReturns: number; // Total returns from the backtest.
    trades: number; // Number of trades executed during the backtest.
    winRate: number; // Win rate percentage of the trades.
    performanceMetrics: string; // A string summarizing performance metrics.
}

export const HistoricalDataSchema = z.object({
    timestamp: z.number().int().positive().describe('Timestamp in seconds since the epoch, must be a positive integer.'),
    price: z.number().positive().describe('Price at the timestamp, must be a positive number.')
});

export const StrategyParametersSchema = z.object({
    slippage: z.number().min(0).max(1).describe('Slippage percentage, must be between 0 and 1.'),
    buyThreshold: z.number().min(0).max(1).describe('Threshold for buying, must be between 0 and 1.'),
    sellThreshold: z.number().min(0).max(1).describe('Threshold for selling, must be between 0 and 1.')
});

export const BacktestResultSchema = z.object({
    id: z.string().uuid().transform((id) => id as BacktestId),
    totalReturns: z.number().describe('Total returns from the backtest.'),
    trades: z.number().int().nonnegative().describe('Number of trades executed during the backtest.'),
    winRate: z.number().min(0).max(100).describe('Win rate percentage of the trades.'),
    performanceMetrics: z.string().describe('A string summarizing performance metrics.')
});

export const BacktestEventSchema = z.union([
    z.object({ type: z.literal('BACKTEST_CREATED'), data: BacktestResultSchema }),
    z.object({ type: z.literal('BACKTEST_UPDATED'), data: BacktestResultSchema }),
    z.object({ type: z.literal('BACKTEST_ERROR'), message: z.string() })
]);