// Shared TypeScript types and Zod schemas
import { z } from 'zod';

/**
 * Branded types for IDs to ensure type safety.
 */
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Interface representing a configuration item.
 * @property key - The configuration key (must be a non-empty string).
 * @property value - The configuration value (must be a non-empty string).
 */
export interface ConfigurationItem {
    key: string;
    value: string;
}

/**
 * Zod schema for validating ConfigurationItem.
 */
export const ConfigurationItemSchema = z.object({
    key: z.string().min(1, { message: 'Key cannot be empty' }),
    value: z.string().min(1, { message: 'Value cannot be empty' }),
});

/**
 * Discriminated union for different event types.
 */
export type EventType =
    | { type: 'CONFIGURATION_CREATED'; payload: ConfigurationItem }
    | { type: 'SERVICE_HEALTH_UPDATED'; payload: { [service: string]: string } };

/**
 * Zod schema for validating events.
 */
export const EventTypeSchema = z.union([
    z.object({ type: z.literal('CONFIGURATION_CREATED'), payload: ConfigurationItemSchema }),
    z.object({ type: z.literal('SERVICE_HEALTH_UPDATED'), payload: z.record(z.string()) }),
]);

/**
 * Function to validate events at runtime.
 * @param event - The event to validate.
 * @returns The validated event if it matches the schema.
 * @throws Error if validation fails.
 */
export const validateEvent = (event: unknown): EventType => {
    const result = EventTypeSchema.safeParse(event);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};
