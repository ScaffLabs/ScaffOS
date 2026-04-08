export interface Message<T> {
    topic: string;
    data: T;
    timestamp: number;
}

export interface UserCreated {
    userId: UserId;
    username: string;
}

export type EventMessages = UserCreated;

import { z } from 'zod';

// Zod schema for message validation
export const messageSchema = z.object({
    topic: z.string(),
    data: z.any(),
    timestamp: z.number(),
});

export type MessageSchemaType = z.infer<typeof messageSchema>;