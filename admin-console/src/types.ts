// Shared TypeScript types and Zod schemas
import { z } from 'zod';

export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };
export type ConfigKey = string & { readonly brand: unique symbol };

export interface ConfigurationItem {
    key: ConfigKey;
    value: string;
}

export const ConfigurationItemSchema = z.object({
    key: z.string().min(1, { message: 'Key cannot be empty' }).transform((key) => key as ConfigKey),
    value: z.string().min(1, { message: 'Value cannot be empty' }),
});

export interface HealthCheckResponse {
    serviceHealth: { [service: string]: string };
    database: 'up' | 'down';
}

export type AppEvent = 
    | { type: 'CONFIGURATION_CREATED'; payload: ConfigurationItem }
    | { type: 'SERVICE_HEALTH_UPDATED'; payload: HealthCheckResponse }
    | { type: 'CONFIGURATION_DELETED'; payload: { key: ConfigKey } }
    | { type: 'APP_ERROR'; payload: { message: string } };

export const AppEventSchema = z.union([
    z.object({ type: z.literal('CONFIGURATION_CREATED'), payload: ConfigurationItemSchema }),
    z.object({ type: z.literal('SERVICE_HEALTH_UPDATED'), payload: z.object({ serviceHealth: z.record(z.string()), database: z.enum(['up', 'down']) }) }),
    z.object({ type: z.literal('CONFIGURATION_DELETED'), payload: z.object({ key: z.string() }) }),
    z.object({ type: z.literal('APP_ERROR'), payload: z.object({ message: z.string() }) })
]);

export const validateAppEvent = (event: unknown): AppEvent => {
    const result = AppEventSchema.safeParse(event);
    if (!result.success) {
        throw new Error(result.error.errors.map(err => err.message).join(', '));
    }
    return result.data;
};