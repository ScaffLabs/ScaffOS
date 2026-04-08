// Shared TypeScript types and Zod schemas
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

export interface ConfigurationItem {
    key: string;
    value: string;
}

export const ConfigurationItemSchema = z.object({
    key: z.string().min(1, { message: 'Key cannot be empty' }),
    value: z.string().min(1, { message: 'Value cannot be empty' }),
});

export interface HealthCheckResponse {
    serviceHealth: { [service: string]: string };
    database: 'up' | 'down';
}

export interface Migration {
    id: string;
    up: () => Promise<void>;
    down: () => Promise<void>;
}

export const MigrationSchema = z.object({
    id: z.string().min(1),
    up: z.function().args().returns(z.promise(z.void())),
    down: z.function().args().returns(z.promise(z.void())),
});

export const validateMigration = (migration: unknown): Migration => {
    const result = MigrationSchema.safeParse(migration);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};