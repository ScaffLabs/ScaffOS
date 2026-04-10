import axios from 'axios';
import { createConnectionPool, serviceEmitter } from './connectionPool';
import logger from './logger';
import config from './config';

const connectionPool = createConnectionPool();
const SERVICE_URLS = {
    orderService: config.ORDER_SERVICE_URL,
    userService: config.USER_SERVICE_URL,
};

const checkService = async (service) => {
    try {
        const response = await connectionPool.requestWithRetry(service, 'get', '/health');
        return response.status === 'UP';
    } catch (error) {
        logger.error({ error: error.message }, `Error checking ${service}`);
        return false;
    }
};

export const checkServiceHealth = async () => {
    const results = await Promise.all(Object.keys(SERVICE_URLS).map(service => checkService(service)));
    return Object.keys(SERVICE_URLS).reduce((acc, service, index) => {
        acc[service] = results[index];
        return acc;
    }, {});
};

export const emitHealthCheckEvent = async () => {
    const healthStatus = await checkServiceHealth();
    const event = { type: 'SERVICE_HEALTH_CHECK', status: healthStatus };
    serviceEmitter.emit('healthCheck', event);
};