import { z } from 'zod';

// Branded types for IDs
export type UserId = string & { readonly brand: unique symbol }; // Example for UserId
export type ApiKeyId = string & { readonly brand: unique symbol }; // Example for ApiKey

// User interface with detailed type definitions
export interface User {
    id: UserId;
    username: string;
    email: string;
}

// Zod schema for User validation
export const UserSchema = z.object({
    id: z.string().refine((id) => id.length > 0, { message: 'User ID must not be empty' }).transform((id) => id as UserId),
    username: z.string().min(1, { message: 'Username must be at least 1 character long' }),
    email: z.string().email({ message: 'Invalid email format' }),
});

// API Key interface
export interface ApiKey {
    id: ApiKeyId;
    userId: UserId;
}

// Zod schema for API Key validation
export const ApiKeySchema = z.object({
    id: z.string().refine((id) => id.length > 0, { message: 'API Key ID must not be empty' }).transform((id) => id as ApiKeyId),
    userId: z.string().refine((id) => id.length > 0, { message: 'User ID must not be empty' }).transform((id) => id as UserId),
});

// Exporting types for other services to use
export type { UserId, ApiKeyId, User, ApiKey };