import redisClient from './redisClient';
import { Message } from './messageSchema';
import { Event } from './types';

type MessageHandler<T> = (message: Message<T>) => void;

const handleUserCreated: MessageHandler<Event> = (message) => {
    console.log('User created event received:', message);
    // Handle the user created event
};

export const subscribe = <T>(topic: string, handler: MessageHandler<T>): void => {
    redisClient.subscribe(topic, (message) => {
        try {
            const parsedMessage: Message<T> = JSON.parse(message);
            handler(parsedMessage);
        } catch (error) {
            console.error('Error parsing message', error);
        }
    });
};

subscribe<Event>('userCreated', handleUserCreated);