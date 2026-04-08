import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Represents price data for an exchange.
 * @property exchange - The name of the exchange.
 * @property price - The price in USD.
 * @property volume - The traded volume.
 */
export interface PriceData {
  exchange: string;
  price: number;
  volume: number;
}

/**
 * Represents the current prices from various exchanges.
 */
export interface CurrentPrices {
  [key: string]: number;
}

// Zod schema for PriceData validation
export const PriceDataSchema = z.object({
  exchange: z.string().nonempty(),
  price: z.number().positive(),
  volume: z.number().positive(),
});

// Zod schema for CurrentPrices validation
export const CurrentPricesSchema = z.record(z.number().positive());