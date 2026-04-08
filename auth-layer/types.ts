// Branded types for IDs
export type UserId = string & { readonly brand: unique symbol }; // Example for UserId
export type ApiKeyId = string & { readonly brand: unique symbol }; // Example for ApiKey
export type OrderId = string & { readonly brand: unique symbol }; // Example for OrderId
export type TradeId = string & { readonly brand: unique symbol }; // Example for TradeId

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

// Event interface
export type UserCreatedEvent = {
    type: 'UserCreated';
    payload: User;
};

export type Event = UserCreatedEvent;

// Zod schema for event validation
export const EventSchema = z.union([
    z.object({
        type: z.literal('UserCreated'),
        payload: UserSchema,
    }),
]);

// Exporting types for other services to use
export type { UserId, ApiKeyId, OrderId, TradeId, User, ApiKey, Event };