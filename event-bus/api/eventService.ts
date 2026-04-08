import axios from 'axios';
import { config } from '../config';
import { Message, UserCreated } from '../messageSchema';
import eventBus from '../eventBus';
import { circuitBreaker } from '../utils/retry';
import { checkHealth } from './healthCheck';

const fetchUserService = async (userId: string) => {
    const url = `${config.OTHER_SERVICE_URL}/users/${userId}`;
    return await axios.get(url);
};

const fetchUserServiceWithRetry = circuitBreaker(fetchUserService);

export const handleUserCreatedEvent = async (message: Message<UserCreated>) => {
    try {
        const response = await fetchUserServiceWithRetry(message.data.userId);
        console.log('Fetched user data:', response.data);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
    }
};

// Subscribe to userCreated events
eventBus.subscribe<UserCreated>('userCreated', handleUserCreatedEvent);

export const checkServiceHealth = async () => {
    try {
        const health = await checkHealth();
        return health.serviceHealthy;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};