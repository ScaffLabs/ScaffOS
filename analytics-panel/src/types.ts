// analytics-panel/src/types.ts
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
    drawdown: z.array(z.number()).nonempty(),
    maxDrawdown: z.number().nonnegative(),
    sharpeRatio: z.number().nonnegative(),
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
    name: z.string().min(1, { message: 'Name must be at least 1 character long.' })
        .regex(/^[a-zA-Z0-9_]+$/, { message: 'Name must be alphanumeric.' }),
    parameters: z.record(z.any()).optional(),
});

/**
 * Discriminated union for event types in the analytics system.
 */
export type AnalyticsEvent =
    | { type: 'PERFORMANCE_METRICS_FETCHED'; data: PerformanceMetrics }
    | { type: 'STRATEGY_COMPARISON_RESULT'; betterStrategy: string };

/**
 * Schema for validating event data using Zod for each event type.
 */
export const AnalyticsEventSchema = z.union([
    z.object({
        type: z.literal('PERFORMANCE_METRICS_FETCHED'),
        data: PerformanceMetricsSchema,
    }),
    z.object({
        type: z.literal('STRATEGY_COMPARISON_RESULT'),
        betterStrategy: z.string().min(1),
    }),
]);

/**
 * Type for error handling in service calls.
 */
export enum ErrorType {
    SERVICE_ERROR = 'SERVICE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    NOT_FOUND = 'NOT_FOUND',
}

/**
 * Interface for structured error response.
 */
export interface ErrorResponse {
    /** The type of error that occurred. */
    type: ErrorType;
    /** A human-readable message describing the error. */
    message: string;
}