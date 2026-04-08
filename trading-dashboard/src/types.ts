import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };
export type PositionId = string & { readonly brand: unique symbol };

// Type for Order details
export interface Order {
    id: OrderId;
    symbol: string;
    quantity: number;
    type: 'buy' | 'sell';
}

// Type for Position
export interface Position {
    id: PositionId;
    symbol: string;
    quantity: number;
}

// Event types
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

export const validateOrder = (data: unknown): Order => {
    const result = OrderSchema.safeParse(data);
    if (!result.success) throw new Error('Invalid order data');
    return result.data;
};

export const validatePosition = (data: unknown): Position => {
    const result = PositionSchema.safeParse(data);
    if (!result.success) throw new Error('Invalid position data');
    return result.data;
};

export const validateTradingEvent = (data: unknown): TradingEvent => {
    const result = TradingEventSchema.safeParse(data);
    if (!result.success) throw new Error('Invalid trading event data');
    return result.data;
};