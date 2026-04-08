// Types and schemas for backtester service
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

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
    totalReturns: z.number(),
    trades: z.number().int().nonnegative(),
    winRate: z.number().min(0).max(100),
    performanceMetrics: z.string(),
});

export { HistoricalDataSchema, StrategyParametersSchema, BacktestResultSchema };