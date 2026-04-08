import redisClient from './redisClient';
import axios from 'axios';
import { setInterval } from 'timers';
import { config } from './config';

const checkHealth = async () => {
    let redisHealthy = false;
    let serviceHealthy = false;

    try {
        await redisClient.ping();
        redisHealthy = true;
        console.log('Redis is healthy');
    } catch (error) {
        console.error('Redis connection failed', error);
    }

    try {
        const response = await axios.get(`${config.OTHER_SERVICE_URL}/health`);
        serviceHealthy = response.status === 200;
        console.log('Other service is healthy');
    } catch (error) {
        console.error('Other service connection failed', error);
    }

    return { redisHealthy, serviceHealthy };
};

setInterval(checkHealth, 5000); // Check health every 5 seconds

export default checkHealth;