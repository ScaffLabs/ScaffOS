import redisClient from './redisClient';
import { Message } from './messageSchema';
import { UserCreated } from './types';
import eventBus from './eventBus';
import { checkServiceHealth } from './eventService';

const handleUserCreated: (message: Message<UserCreated>) => void = (message) => {
    console.log('User created event received:', message);
    // Further processing can be added here, e.g., notifying other services
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

const subscribeToUserCreated = async () => {
    await subscribeToTopic('userCreated', handleUserCreated);
};

subscribeToUserCreated();

export const healthCheck = async (req, res) => {
    const isHealthy = await checkServiceHealth();
    res.status(isHealthy ? 200 : 503).json({ healthy: isHealthy });
};
