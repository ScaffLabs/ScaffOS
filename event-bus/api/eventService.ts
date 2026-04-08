import axios from 'axios';
import { config } from '../config';
import { Message, UserCreated } from '../messageSchema';
import eventBus from '../eventBus';
import logger from '../logger';

const fetchUserService = async (userId: string) => {
    const url = `${config.OTHER_SERVICE_URL}/users/${userId}`;
    return await axios.get(url);
};

const fetchUserServiceWithRetry = async (userId: string) => {
    let retries = 3;
    while (retries > 0) {
        try {
            return await fetchUserService(userId);
        } catch (error) {
            retries--;
            logger.error('Error fetching user data, retrying...', error.message);
            if (retries === 0) throw error;
            await new Promise(res => setTimeout(res, 1000)); // wait before retrying
        }
    }
};

export const handleUserCreatedEvent = async (message: Message<UserCreated>) => {
    try {
        const response = await fetchUserServiceWithRetry(message.data.userId);
        logger.info('Fetched user data:', response.data);
    } catch (error) {
        logger.error('Error fetching user data:', error.message);
    }
};

// Subscribe to userCreated events
eventBus.subscribe<UserCreated>('userCreated', handleUserCreatedEvent);

export const checkServiceHealth = async () => {
    try {
        const response = await axios.get(`${config.OTHER_SERVICE_URL}/health`);
        return response.status === 200;
    } catch (error) {
        logger.error('Health check for other service failed:', error);
        return false;
    }
};