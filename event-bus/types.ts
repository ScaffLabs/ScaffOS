// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type UserId = string & { readonly brand: unique symbol };

// Discriminated union for event types
export type EventType = 'userCreated' | 'orderPlaced';

/**
 * Event interface defining the structure of events in the system.
 * @property id - Unique identifier for the event, must be a valid UUID.
 * @property title - Title of the event. Must be a non-empty string.
 * @property description - Optional description of the event.
 * @property type - The type of event being represented, must be one of the defined event types.
 * @property createdAt - The date when the event was created, defaults to the current date.
 * @property updatedAt - The date when the event was last updated, defaults to the current date when created.
 */
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
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
});

// Zod schema for incoming events
export const createEventSchema = eventSchema.omit({ id: true });

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