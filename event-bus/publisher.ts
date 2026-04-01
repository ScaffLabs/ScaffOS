import redisClient from './redisClient';
import { Message } from './messageSchema';
import { cacheMessage, isMessageCached } from './cache';

export const publish = async <T>(message: Message<T>): Promise<void> => {
    const { topic, data } = message;
    if (!topic || typeof topic !== 'string') {
        throw new Error('Invalid topic');
    }
    if (!data) {
        throw new Error('Invalid data');
    }
    // Check if the message is already cached
    if (isMessageCached(topic, data)) {
        console.log('Message is already published, skipping.');
        return;
    }
    // Cache the message before publishing
    cacheMessage(topic, data);
    try {
        await redisClient.publish(topic, JSON.stringify(data));
    } catch (error) {
        console.error('Error publishing message', error);
        throw new Error('Failed to publish message');
    }
};