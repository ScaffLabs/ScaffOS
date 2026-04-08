import axios from 'axios';
import { config } from '../config';
import { Message, UserCreated } from '../messageSchema';
import eventBus from '../eventBus';
import { circuitBreaker } from '../utils/retry';

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

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${config.OTHER_SERVICE_URL}/health`);
        return response.status === 200;
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
};
