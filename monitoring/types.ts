// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

// LatencyData interface with a branded type for timestamp
export interface LatencyData {
    path: string; // The path of the request
    duration: number; // Duration in milliseconds
    timestamp: Date & { readonly brand: unique symbol }; // Timestamp of the latency record
}

// Zod schema for LatencyData validation
export const LatencyDataSchema = z.object({
    path: z.string().nonempty(),
    duration: z.number().nonnegative(),
    timestamp: z.date().transform((date) => new Date(date.toISOString())),
});

// Discriminated union for events
export type MonitoringEvent =  
    | { type: 'LATENCY_RECORD', data: LatencyData }
    | { type: 'SERVICE_HEALTH_CHECK', status: Record<string, boolean> };

// Zod schema for MonitoringEvent validation
export const MonitoringEventSchema = z.union([
    z.object({
        type: z.literal('LATENCY_RECORD'),
        data: LatencyDataSchema,
    }),
    z.object({
        type: z.literal('SERVICE_HEALTH_CHECK'),
        status: z.record(z.string(), z.boolean()),
    }),
]);

// Exporting the schemas for use in other services
export { LatencyDataSchema, MonitoringEventSchema };