import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

// Order Types
export interface Order {
    /** Unique identifier for the order */
    id: OrderId;
    /** Type of the order: 'limit', 'market', 'stop' */
    type: 'limit' | 'market' | 'stop';
    /** Price at which the order is placed */
    price: number;
    /** Quantity of assets to be traded */
    quantity: number;
    /** Current status of the order */
    status: 'open' | 'filled' | 'cancelled';
}

// Zod schemas for runtime validation
export const OrderSchema = z.object({
    id: z.string().transform((id) => id as OrderId),
    type: z.enum(['limit', 'market', 'stop']),
    price: z.number().positive(),
    quantity: z.number().int().positive(),
    status: z.enum(['open', 'filled', 'cancelled']),
});

export interface OrderCreatedEvent {
    type: 'ORDER_CREATED';
    payload: Order;
}

export interface OrderUpdatedEvent {
    type: 'ORDER_UPDATED';
    payload: Order;
}

export interface OrderDeletedEvent {
    type: 'ORDER_DELETED';
    payload: { id: OrderId };
}

export type OrderEvent = OrderCreatedEvent | OrderUpdatedEvent | OrderDeletedEvent;

// Shared types for other services
export const OrderEventSchema = z.union([
    z.object({ type: z.literal('ORDER_CREATED'), payload: OrderSchema }),
    z.object({ type: z.literal('ORDER_UPDATED'), payload: OrderSchema }),
    z.object({ type: z.literal('ORDER_DELETED'), payload: z.object({ id: z.string().transform((id) => id as OrderId) }) }),
]);