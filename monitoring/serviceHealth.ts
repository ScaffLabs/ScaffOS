// serviceHealth.ts
import { createConnectionPool, serviceEmitter } from './connectionPool';
import logger from './logger';
import config from './config';
import axios from 'axios';

const connectionPool = createConnectionPool();

const SERVICE_URLS = {
    orderService: config.ORDER_SERVICE_URL,
    userService: config.USER_SERVICE_URL,
};

const MAX_RETRIES = 3;
const TIMEOUT = 5000;

const checkService = async (service: keyof typeof SERVICE_URLS, retries = MAX_RETRIES): Promise<boolean> => {
    try {
        const response = await axios.get(`${SERVICE_URLS[service]}/health`, { timeout: TIMEOUT });
        return response.data.status === 'UP';
    } catch (error) {
        logger.error({ error: error.message }, `Error checking ${service}`);
        if (retries > 0) {
            return checkService(service, retries - 1);
        }
        return false;
    }
};

export const checkServiceHealth = async (): Promise<Record<string, boolean>> => {
    const results = await Promise.all(Object.keys(SERVICE_URLS).map(service => checkService(service as keyof typeof SERVICE_URLS)));
    return Object.keys(SERVICE_URLS).reduce((acc, service, index) => {
        acc[service] = results[index];
        return acc;
    }, {} as Record<string, boolean>);
};

export const emitHealthCheckEvent = async () => {
    const healthStatus = await checkServiceHealth();
    const event = { type: 'SERVICE_HEALTH_CHECK', status: healthStatus };
    serviceEmitter.emit('healthCheck', event);
};

// Health check endpoint to validate connectivity to dependent services
export const healthCheckServices = async (req: Request, res: Response) => {
    try {
        const healthStatus = await checkServiceHealth();
        res.status(200).json({ status: 'UP', services: healthStatus });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};