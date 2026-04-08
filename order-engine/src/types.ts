import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

// Order Types
export interface Order {
  id: OrderId;
  type: 'limit' | 'market' | 'stop';
  price: number;
  quantity: number;
  status: 'open' | 'filled' | 'cancelled';
}

export interface LimitOrder extends Order {
  type: 'limit';
  limitPrice: number;
}

export interface MarketOrder extends Order {
  type: 'market';
}

export interface StopOrder extends Order {
  type: 'stop';
  stopPrice: number;
}

// Zod Schemas for runtime validation
export const OrderSchema = z.object({
  id: z.string().transform((val) => val as OrderId),
  type: z.enum(['limit', 'market', 'stop']),
  price: z.number().positive(),
  quantity: z.number().positive(),
  status: z.enum(['open', 'filled', 'cancelled'])
});

export const LimitOrderSchema = OrderSchema.extend({
  type: z.literal('limit'),
  limitPrice: z.number().positive()
});

export const MarketOrderSchema = OrderSchema.extend({
  type: z.literal('market'),
});

export const StopOrderSchema = OrderSchema.extend({
  type: z.literal('stop'),
  stopPrice: z.number().positive()
});

// Exporting schemas for external use
export type OrderTypes = Order | LimitOrder | MarketOrder | StopOrder;
export const OrderSchemas = { OrderSchema, LimitOrderSchema, MarketOrderSchema, StopOrderSchema };