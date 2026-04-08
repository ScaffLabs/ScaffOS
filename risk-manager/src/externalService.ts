import axios from 'axios';
import logger from './logger';
import config from './config';

const exponentialBackoff = (retryCount: number) => {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
};

const fetchWithRetry = async (url: string, retries: number = 5): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, { timeout: 5000 }); // 5 seconds timeout
            return response.data;
        } catch (error) {
            logger.warn(`Attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) throw error;
            await exponentialBackoff(i);
        }
    }
};

export const fetchEventBusData = async () => {
    const url = `${config.EVENT_BUS_URL}/events`;
    return await fetchWithRetry(url);
};

export const fetchAnotherServiceData = async () => {
    const url = `${config.ANOTHER_SERVICE_URL}/data`;
    return await fetchWithRetry(url);
};

export const healthCheckServices = async () => {
    const eventBusHealth = await checkServiceHealth(config.EVENT_BUS_URL);
    const anotherServiceHealth = await checkServiceHealth(config.ANOTHER_SERVICE_URL);
    return { eventBus: eventBusHealth, anotherService: anotherServiceHealth };
};

const checkServiceHealth = async (url: string): Promise<boolean> => {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        logger.error(`Health check failed for ${url}: ${error.message}`);
        return false;
    }
};