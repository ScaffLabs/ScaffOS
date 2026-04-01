import redisClient from './redisClient';
import { setInterval } from 'timers';

const checkHealth = async () => {
    try {
        await redisClient.ping();
        console.log('Redis is healthy');
    } catch (error) {
        console.error('Redis connection failed', error);
    }
};

setInterval(checkHealth, 5000); // Check every 5 seconds