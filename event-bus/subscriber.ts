import redisClient from './redisClient';
import { Message } from './messageSchema';
import { Event } from './types';
import { circuitBreaker } from './utils/retry';

const handleUserCreated: (message: Message<Event>) => void = (message) => {
    console.log('User created event received:', message);
    // Business logic to handle the user created event
};

const subscribeToTopic = circuitBreaker((topic: string, handler: (message: Message<Event>) => void) => {
    redisClient.subscribe(topic, (message) => {
        try {
            const parsedMessage: Message<Event> = JSON.parse(message);
            handler(parsedMessage);
        } catch (error) {
            console.error('Error parsing message', error);
        }
    });
});

subscribeToTopic('userCreated', handleUserCreated);
