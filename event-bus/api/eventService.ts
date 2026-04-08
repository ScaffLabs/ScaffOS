import axios from 'axios';
import { config } from '../config';
import { Message, UserCreated } from '../messageSchema';
import { circuitBreaker } from '../utils/retry';
import eventBus from '../eventBus';

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

eventBus.subscribe<UserCreated>('userCreated', handleUserCreatedEvent);
