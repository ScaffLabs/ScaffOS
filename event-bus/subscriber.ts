import redisClient from './redisClient';
import { Message } from './messageSchema';
import { UserCreated } from './types';
import { circuitBreaker } from './utils/retry';
import eventBus from './eventBus';

const handleUserCreated: (message: Message<UserCreated>) => void = (message) => {
    console.log('User created event received:', message);
    // Further processing can be added here
};

const subscribeToTopic = async (topic: string, handler: (message: Message<UserCreated>) => void) => {
    try {
        redisClient.subscribe(topic, (message) => {
            try {
                const parsedMessage: Message<UserCreated> = JSON.parse(message);
                handler(parsedMessage);
            } catch (error) {
                console.error('Error parsing message', error);
            }
        });
    } catch (error) {
        console.error('Error subscribing to topic:', error);
    }
};

const subscribeToUserCreated = circuitBreaker(() => subscribeToTopic('userCreated', handleUserCreated));

subscribeToUserCreated();