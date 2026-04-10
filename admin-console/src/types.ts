import { z } from 'zod';

export type ConfigurationKey = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

export interface ConfigurationItem {
    key: ConfigurationKey;
    value: string;
}

export const ConfigurationItemSchema = z.object({
    key: z.string().min(1, { message: 'Key cannot be empty' }).transform((key) => key as ConfigurationItem['key']),
    value: z.string().min(1, { message: 'Value cannot be empty' }),
});

export interface HealthCheckResponse {
    serviceHealth: { [service: string]: string };
    database: 'up' | 'down';
}

export interface AppEvent { 
    type: 'CONFIGURATION_CREATED' | 'CONFIGURATION_DELETED';
    payload: ConfigurationItem;
}

export const AppEventSchema = z.union([
    z.object({ type: z.literal('CONFIGURATION_CREATED'), payload: ConfigurationItemSchema }),
    z.object({ type: z.literal('CONFIGURATION_DELETED'), payload: z.object({ key: z.string() }) }),
]);

export const validateAppEvent = (event: unknown): AppEvent => {
    const result = AppEventSchema.safeParse(event);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};

// Shared types for other services
export type { UserId, OrderId, TradeId };