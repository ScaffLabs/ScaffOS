import redisClient from './redisClient';
import { Message } from './messageSchema';
import { cacheMessage, isMessageCached } from './cache';
import { z } from 'zod';
import { createEventSchema } from './types';
import { ServiceError } from './errors/serviceError';

export const publish = async <T>(message: Message<T>, retries = 3, backoff = 1000): Promise<void> => {
    const validation = createEventSchema.safeParse(message.data);
    if (!validation.success) {
        throw new ServiceError('Invalid message data: ' + validation.error.errors.map(err => err.message).join(', '));
    }

    const { topic, data } = message;
    if (!topic || typeof topic !== 'string') {
        throw new ServiceError('Invalid topic');
    }
    if (data === null || data === undefined) {
        throw new ServiceError('Invalid data');
    }

    if (isMessageCached(topic, data)) {
        console.log('Message is already published, skipping.');
        return;
    }

    cacheMessage(topic, data);
    try {
        await redisClient.publishWithTimeout(topic, data);
    } catch (error) {
        console.error('Error publishing message, retrying...', error);
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, backoff)); // wait before retrying
            return publish(message, retries - 1, backoff * 2); // Exponential backoff
        }
        throw new ServiceError('Failed to publish message after retries');
    }
};