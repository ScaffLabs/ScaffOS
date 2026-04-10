// Types and Zod schemas for the Admin Console service
import { z } from 'zod';

// Branded types for IDs
export type ConfigurationKey = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Represents a configuration item with a unique key and value.
 * @property {ConfigurationKey} key - The unique key for the configuration item.
 * @property {string} value - The value associated with the configuration item.
 */
export interface ConfigurationItem {
    key: ConfigurationKey;
    value: string;
}

/** Zod schema for validating ConfigurationItem objects */
export const ConfigurationItemSchema = z.object({
    key: z.string().min(1, { message: 'Key cannot be empty' }).transform((key) => key as ConfigurationItem['key']),
    value: z.string().min(1, { message: 'Value cannot be empty' }),
});

/**
 * Represents the response for health check endpoints.
 * @property {Object.<string, string>} serviceHealth - The health status of each service.
 * @property {'up' | 'down'} database - The database connection status.
 */
export interface HealthCheckResponse {
    serviceHealth: { [service: string]: string };
    database: 'up' | 'down';
}

/**
 * Represents application events such as configuration changes.
 * @property {'CONFIGURATION_CREATED' | 'CONFIGURATION_DELETED'} type - The type of event.
 * @property {ConfigurationItem} payload - The associated configuration item.
 */
export interface AppEvent {
    type: 'CONFIGURATION_CREATED' | 'CONFIGURATION_DELETED';
    payload: ConfigurationItem;
}

/** Zod schema for validating AppEvent objects */
export const AppEventSchema = z.union([
    z.object({ type: z.literal('CONFIGURATION_CREATED'), payload: ConfigurationItemSchema }),
    z.object({ type: z.literal('CONFIGURATION_DELETED'), payload: z.object({ key: z.string() }) }),
]);

/**
 * Validates an event against the AppEvent schema.
 * @param {unknown} event - The event to validate.
 * @returns {AppEvent} - The validated event.
 * @throws {Error} - Throws if validation fails.
 */
export const validateAppEvent = (event: unknown): AppEvent => {
    const result = AppEventSchema.safeParse(event);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};

// Shared types for other services
export type { UserId, OrderId, TradeId };