// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

// Order Types
export interface Order {
  /** Unique identifier for the order */
  id: OrderId;
  /** Type of the order: 'limit', 'market', or 'stop' */
  type: 'limit' | 'market' | 'stop';
  /** Price at which the order is placed */
  price: number;
  /** Quantity of assets to be traded */
  quantity: number;
  /** Current status of the order */
  status: 'open' | 'filled' | 'cancelled';
}

export interface LimitOrder extends Order {
  /** Order type is 'limit' */
  type: 'limit';
  /** Maximum price at which to buy or minimum price to sell */
  limitPrice: number;
}

export interface MarketOrder extends Order {
  /** Order type is 'market' */
  type: 'market';
}

export interface StopOrder extends Order {
  /** Order type is 'stop' */
  type: 'stop';
  /** Price at which the stop order becomes a market order */
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