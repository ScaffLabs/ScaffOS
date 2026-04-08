// Types and Schemas for Analytics Panel
import { z } from 'zod';

/**
 * Branded types for unique identification of entities.
 */
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Performance Metrics type representing the structure of performance data.
 */
export interface PerformanceMetrics {
    /** The drawdown values in percentage. */
    drawdown: number[];
    /** The maximum drawdown value. */
    maxDrawdown: number;
    /** The Sharpe ratio value. */
    sharpeRatio: number;
}

/**
 * Schema for validating performance metrics using Zod.
 */
export const PerformanceMetricsSchema = z.object({
    drawdown: z.array(z.number()),
    maxDrawdown: z.number(),
    sharpeRatio: z.number(),
});

/**
 * Strategy type representing the structure of a trading strategy.
 */
export interface Strategy {
    /** The name of the strategy. Must be alphanumeric. */
    name: string;
    /** The parameters for the strategy as an object. */
    parameters: Record<string, any>;
}

/**
 * Schema for validating strategies using Zod.
 */
export const StrategySchema = z.object({
    name: z.string().min(1),
    parameters: z.object({}).catchall(z.any()),
});

/**
 * Discriminated union for event types in the analytics system.
 */
export type AnalyticsEvent =
    | { type: 'PERFORMANCE_METRICS_FETCHED'; data: PerformanceMetrics }
    | { type: 'STRATEGY_COMPARISON_RESULT'; betterStrategy: string };