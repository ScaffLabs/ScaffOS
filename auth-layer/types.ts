// Branded types for IDs
import { z } from 'zod';

export type UserId = string & { readonly brand: unique symbol }; // Unique identifier for User
export type ApiKeyId = string & { readonly brand: unique symbol }; // Unique identifier for API Key
export type OrderId = string & { readonly brand: unique symbol }; // Unique identifier for Order
export type TradeId = string & { readonly brand: unique symbol }; // Unique identifier for Trade

// User interface with detailed type definitions
export interface User {
    id: UserId; // Unique identifier for the user
    username: string; // Username of the user, must be at least 1 character
    email: string; // Email of the user, must be a valid email format
}

// Zod schema for User validation
export const UserSchema = z.object({
    id: z.string()
        .refine((id) => id.length > 0, { message: 'User ID must not be empty' })
        .transform((id) => id as UserId),
    username: z.string().min(1, { message: 'Username must be at least 1 character long' }),
    email: z.string().email({ message: 'Invalid email format' }),
});

// API Key interface
export interface ApiKey {
    id: ApiKeyId; // Unique identifier for the API key
    userId: UserId; // User ID associated with the API key
}

// Zod schema for API Key validation
export const ApiKeySchema = z.object({
    id: z.string()
        .refine((id) => id.length > 0, { message: 'API Key ID must not be empty' })
        .transform((id) => id as ApiKeyId),
    userId: z.string()
        .refine((id) => id.length > 0, { message: 'User ID must not be empty' })
        .transform((id) => id as UserId),
});

// Event interface
export type UserCreatedEvent = {
    type: 'UserCreated'; // Type of the event
    payload: User; // Payload containing user information
};

// Zod schema for event validation
export const EventSchema = z.union([
    z.object({
        type: z.literal('UserCreated'), // Event type
        payload: UserSchema, // User data must conform to User schema
    }),
]);

// Exporting types for other services to use
export type { UserId, ApiKeyId, OrderId, TradeId, User, ApiKey, UserCreatedEvent };