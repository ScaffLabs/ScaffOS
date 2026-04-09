// Types and Schemas for Backtester Service
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };
export type BacktestId = string & { readonly brand: unique symbol };

export interface HistoricalData {
    timestamp: number;
    price: number;
}

export interface StrategyParameters {
    slippage: number;
    buyThreshold: number;
    sellThreshold: number;
}

export interface BacktestResult {
    id: BacktestId;
    totalReturns: number;
    trades: number;
    winRate: number;
    performanceMetrics: string;
}

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
    id: z.string().uuid(),
    totalReturns: z.number(),
    trades: z.number().int().nonnegative(),
    winRate: z.number().min(0).max(100),
    performanceMetrics: z.string(),
});

export const PaginationSchema = z.object({
    limit: z.number().int().min(1).max(100).default(10),
    offset: z.number().int().min(0).default(0),
    sort: z.string().default('createdAt'),
    order: z.enum(['asc', 'desc']).default('asc'),
});

// Discriminated Union for Event Types
export type BacktestEvent =
    | { type: 'BACKTEST_CREATED'; data: BacktestResult }
    | { type: 'BACKTEST_UPDATED'; data: BacktestResult }
    | { type: 'BACKTEST_ERROR'; message: string };

export const BacktestEventSchema = z.union([
    z.object({ type: z.literal('BACKTEST_CREATED'), data: BacktestResultSchema }),
    z.object({ type: z.literal('BACKTEST_UPDATED'), data: BacktestResultSchema }),
    z.object({ type: z.literal('BACKTEST_ERROR'), message: z.string() }),
]);