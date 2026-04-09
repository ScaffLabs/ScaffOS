import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };
export type PositionId = string & { readonly brand: unique symbol };

// Type for Order details
export interface Order {
    /** Unique identifier for the order */
    id: OrderId;
    /** The stock symbol for the order */
    symbol: string;
    /** The quantity of shares to buy/sell */
    quantity: number;
    /** The type of order - either 'buy' or 'sell' */
    type: 'buy' | 'sell';
}

// Type for Position
export interface Position {
    /** Unique identifier for the position */
    id: PositionId;
    /** The stock symbol for the position */
    symbol: string;
    /** The quantity of shares held in the position */
    quantity: number;
}

// Event types for trading events
export type TradingEvent =
    | { type: 'ORDER_SUBMITTED'; order: Order }
    | { type: 'POSITION_UPDATED'; position: Position };

// Zod schemas for runtime validation
export const OrderSchema = z.object({
    id: z.string().brand<OrderId>(),
    symbol: z.string().min(1),
    quantity: z.number().positive(),
    type: z.enum(['buy', 'sell']),
});

export const PositionSchema = z.object({
    id: z.string().brand<PositionId>(),
    symbol: z.string().min(1),
    quantity: z.number().positive(),
});

export const TradingEventSchema = z.union([
    z.object({ type: z.literal('ORDER_SUBMITTED'), order: OrderSchema }),
    z.object({ type: z.literal('POSITION_UPDATED'), position: PositionSchema }),
]);

/**
 * Validates an order data structure
 * @param data - The data to validate
 * @throws Will throw an error if validation fails
 */
export const validateOrder = (data: unknown): Order => {
    const result = OrderSchema.safeParse(data);
    if (!result.success) throw new Error('Invalid order data');
    return result.data;
};

/**
 * Validates a position data structure
 * @param data - The data to validate
 * @throws Will throw an error if validation fails
 */
export const validatePosition = (data: unknown): Position => {
    const result = PositionSchema.safeParse(data);
    if (!result.success) throw new Error('Invalid position data');
    return result.data;
};

/**
 * Validates a trading event data structure
 * @param data - The data to validate
 * @throws Will throw an error if validation fails
 */
export const validateTradingEvent = (data: unknown): TradingEvent => {
    const result = TradingEventSchema.safeParse(data);
    if (!result.success) throw new Error('Invalid trading event data');
    return result.data;
};