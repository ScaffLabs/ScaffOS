import axios from 'axios';
import { DrawdownCircuitBreaker } from './drawdownCircuitBreaker';
import logger from './logger';
import config from './config';

const circuitBreaker = new DrawdownCircuitBreaker(20);

const exponentialBackoff = (retryCount: number) => {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
};

export const fetchWithRetry = async (url: string, retries: number = 5): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (circuitBreaker.isActive) {
                throw new Error('Circuit breaker is active, skipping request');
            }
            if (i === retries - 1) throw error;
            logger.warn(`Retrying... (${i + 1})`);
            await exponentialBackoff(i);
        }
    }
};

export const checkServiceHealth = async (url: string): Promise<boolean> => {
    try {
        const response = await axios.get(url);
        return response.status === 200;
    } catch (error) {
        logger.error(`Health check failed for ${url}: ${error.message}`);
        return false;
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
