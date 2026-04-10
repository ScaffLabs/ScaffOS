import axios from 'axios';
import { config } from '../config';
import { Message, UserCreated } from '../messageSchema';
import eventBus from '../eventBus';
import logger from '../logger';

const fetchUserService = async (userId: string) => {
    const url = `${config.OTHER_SERVICE_URL}/users/${userId}`;
    return await axios.get(url);
};

const fetchUserServiceWithRetry = async (userId: string, retries = 3) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            return await fetchUserService(userId);
        } catch (error) {
            attempt++;
            logger.error('Error fetching user data, attempt:', attempt, error.message);
            if (attempt >= retries) throw error;
            await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempt)));
        }
    }
};

export const handleUserCreatedEvent = async (message: Message<UserCreated>) => {
    try {
        const response = await fetchUserServiceWithRetry(message.data.userId);
        logger.info('Fetched user data:', response.data);
        eventBus.publish('userDataFetched', response.data);
    } catch (error) {
        logger.error('Error fetching user data:', error.message);
    }
};

// Subscribe to userCreated events
eventBus.subscribe<UserCreated>('userCreated', handleUserCreatedEvent);

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${config.OTHER_SERVICE_URL}/health`);
        return response.status === 200;
    } catch (error) {
        logger.error('Health check failed for other service:', error.message);
        return false;
    }
};

export const healthCheckMiddleware = async (req, res, next) => {
    const isHealthy = await checkHealth();
    res.status(isHealthy ? 200 : 503).json({ healthy: isHealthy });
};

export const subscribeToUserCreated = async () => {
    await subscribeToTopic('userCreated', handleUserCreated);
};

subscribeToUserCreated();
