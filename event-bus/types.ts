// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

// Discriminated union for event types
export type EventType = 'userCreated' | 'orderPlaced';

// Event interface with additional properties for better type safety
export interface Event {
    id: OrderId;
    title: string;
    description?: string;
    type: EventType;
    createdAt: Date;
    updatedAt: Date;
}

// Zod schema for Event validation
import { z } from 'zod';

export const eventSchema = z.object({
    id: z.string().uuid().transform((val) => val as OrderId),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
    type: z.enum(['userCreated', 'orderPlaced']),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Zod schema for incoming events
export const createEventSchema = eventSchema.omit({ id: true }).extend({
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

// Zod schema for updating events
export const updateEventSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    updatedAt: z.date().optional(),
});

// Additional types for query parameters
export type GetEventsQuery = {
    limit?: number;
    offset?: number;
    sortBy?: keyof Event;
    order?: 'asc' | 'desc';
};

// Exporting shared types
export type { OrderId, UserId, EventType, Event };