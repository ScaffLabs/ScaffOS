// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

import { z } from 'zod';

/**
 * Represents price data for an exchange.
 * @property exchange - The name of the exchange, must be a non-empty string.
 * @property price - The price in USD, must be a positive number.
 * @property volume - The traded volume, must be a positive number.
 */
export interface PriceData {
    exchange: string;
    price: number;
    volume: number;
}

/**
 * Represents the current prices from various exchanges.
 * This is a mapping of exchange names to their respective prices.
 */
export interface CurrentPrices {
    VWAP?: number; // Optional VWAP field
    [key: string]: number | undefined;
}

// Zod schema for PriceData validation
export const PriceDataSchema = z.object({
    exchange: z.string().nonempty().describe('The name of the exchange, must be a non-empty string.'),
    price: z.number().positive().describe('The price in USD, must be a positive number.'),
    volume: z.number().positive().describe('The traded volume, must be a positive number.'),
});

// Zod schema for CurrentPrices validation
export const CurrentPricesSchema = z.record(z.number().positive()).describe('A record of current prices from exchanges.');

/**
 * Represents the event types for price updates.
 * @property type - The event type, can be 'PRICE_ADDED', 'PRICE_UPDATED', or 'PRICE_DELETED'.
 * @property data - The price data associated with the event.
 */
export type PriceEvent = 
    | { type: 'PRICE_ADDED'; data: PriceData }
    | { type: 'PRICE_UPDATED'; data: PriceData }
    | { type: 'PRICE_DELETED'; exchange: string }; 

/**
 * Zod schema for validating PriceEvent objects.
 */
export const PriceEventSchema = z.union([
    z.object({ type: z.literal('PRICE_ADDED'), data: PriceDataSchema }),
    z.object({ type: z.literal('PRICE_UPDATED'), data: PriceDataSchema }),
    z.object({ type: z.literal('PRICE_DELETED'), exchange: z.string().nonempty() }),
]);