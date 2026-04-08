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
 * Represents a database migration with up and down methods.
 * @property {string} id - Unique identifier for the migration.
 * @property {function} up - Function to apply the migration.
 * @property {function} down - Function to revert the migration.
 */
export interface Migration {
    id: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}

/**
 * Zod schema for validating Migration objects.
 */
export const MigrationSchema = z.object({
    id: z.string().min(1),
    up: z.function().args().returns(z.promise(z.void())),
    down: z.function().args().returns(z.promise(z.void())),
});

/**
 * Validates a migration object against the MigrationSchema.
 * @param migration - The migration object to validate.
 * @throws {Error} Throws an error if validation fails.
 * @returns {Migration} Returns the validated Migration object.
 */
export const validateMigration = (migration: unknown): Migration => {
    const result = MigrationSchema.safeParse(migration);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};
