import { z } from 'zod';

// Branded types for IDs
export type OrderId = string & { readonly brand: unique symbol };
export type TradeId = string & { readonly brand: unique symbol };

/**
 * Represents an Event with a unique identifier and details.
 * @property {OrderId} id - The unique identifier for the event.
 * @property {string} title - The title of the event.
 * @property {string} [description] - A brief description of the event.
 */
export interface Event {
    id: OrderId;
    title: string;
    description?: string;
}

// Zod schema for Event validation
export const eventSchema = z.object({
    id: z.string().refine((val) => val.length > 0, { message: 'ID cannot be empty' }) as z.ZodType<OrderId>,
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
});

// Zod schema for incoming events
export const createEventSchema = eventSchema.omit({ id: true }).extend({
    id: z.string().uuid().transform((val) => val as OrderId),
});

// Zod schema for updating events
export const updateEventSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
});

// Event Messages Types
export interface UserCreated {
    userId: string;
    username: string;
}

export type EventMessages = UserCreated;