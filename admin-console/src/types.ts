// Shared TypeScript types and Zod schemas
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Represents a configuration item with a key and value.
 * @property {string} key - The unique identifier for the configuration.
 * @property {string} value - The value associated with the configuration key.
 */
export interface ConfigurationItem {
    key: string;
    value: string;
}

/**
 * Zod schema for validating ConfigurationItem objects.
 * Ensures that both key and value are non-empty strings.
 */
export const ConfigurationItemSchema = z.object({
    key: z.string().min(1, { message: 'Key cannot be empty' }),
    value: z.string().min(1, { message: 'Value cannot be empty' }),
});

/**
 * Represents the response from a health check.
 * @property {object} serviceHealth - A key-value map of service names to their health status.
 * @property {'up' | 'down'} database - The status of the database connection.
 */
export interface HealthCheckResponse {
    serviceHealth: { [service: string]: string };
    database: 'up' | 'down';
}

/**
 * Represents an event in the application.
 * This can be used to manage different types of application events.
 */
export type AppEvent = 
    | { type: 'CONFIGURATION_CREATED'; payload: ConfigurationItem }
    | { type: 'SERVICE_HEALTH_UPDATED'; payload: HealthCheckResponse };

/**
 * Zod schema for validating AppEvent objects.
 */
export const AppEventSchema = z.union([
    z.object({ type: z.literal('CONFIGURATION_CREATED'), payload: ConfigurationItemSchema }),
    z.object({ type: z.literal('SERVICE_HEALTH_UPDATED'), payload: z.object({ serviceHealth: z.record(z.string()), database: z.enum(['up', 'down']) }) }),
]);

/**
 * Validates an event object against the AppEventSchema.
 * @param event - The event object to validate.
 * @throws {Error} Throws an error if validation fails.
 * @returns {AppEvent} Returns the validated AppEvent object.
 */
export const validateAppEvent = (event: unknown): AppEvent => {
    const result = AppEventSchema.safeParse(event);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};