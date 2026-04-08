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
    id: z.string().uuid().transform((val) => val as OrderId),
    title: z.string().min(1, { message: 'Title is required' }),
    description: z.string().optional(),
});

// Zod schema for incoming events
export const createEventSchema = eventSchema.omit({ id: true });

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

/**
 * Represents a message sent over the event bus.
 * @property {string} topic - The topic of the message.
 * @property {T} data - The data payload of the message.
 * @property {number} timestamp - The timestamp when the message was created.
 */
export interface Message<T> {
    topic: string;
    data: T;
    timestamp: number;
}

/**
 * Represents a specific event message for user creation.
 * @property {string} topic - The topic of the message.
 * @property {UserCreated} data - The data payload containing user details.
 * @property {number} timestamp - The timestamp when the message was created.
 */
export type UserCreatedMessage = Message<UserCreated>;
