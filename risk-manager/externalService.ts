import axios from 'axios';
import logger from './logger';
import config from './config';

const exponentialBackoff = (retryCount: number) => {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 100));
};

let failureCount = 0;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_TIMEOUT = 30000;
let isCircuitOpen = false;
let circuitBreakerTimeout: NodeJS.Timeout;

const fetchWithRetry = async (url: string, retries: number = 5): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            return response.data;
        } catch (error) {
            logger.warn(`Attempt ${i + 1} failed: ${error.message}`);
            if (i === retries - 1) {
                logger.error('Final attempt failed:', error);
                throw error;
            }
            await exponentialBackoff(i);
        }
    }
};

const circuitBreaker = async (url: string) => {
    if (isCircuitOpen) {
        throw new Error('Circuit breaker is open. Please try later.');
    }
    try {
        const data = await fetchWithRetry(url);
        failureCount = 0;
        return data;
    } catch (error) {
        failureCount++;
        logger.error('Error fetching data:', error);
        if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
            isCircuitOpen = true;
            circuitBreakerTimeout = setTimeout(() => {
                isCircuitOpen = false;
                failureCount = 0;
            }, CIRCUIT_BREAKER_TIMEOUT);
        }
        throw error;
    }
};

export const healthCheckServices = async () => {
    const eventBusHealth = await circuitBreaker(config.EVENT_BUS_URL);
    const anotherServiceHealth = await circuitBreaker(config.ANOTHER_SERVICE_URL);
    return { eventBus: eventBusHealth, anotherService: anotherServiceHealth };
};

export const fetchRiskData = async (riskId: string) => {
    const url = `${config.ANOTHER_SERVICE_URL}/risk/${riskId}`;
    return await circuitBreaker(url);
};

export const postRiskEvent = async (event: any) => {
    const url = `${config.EVENT_BUS_URL}/events`;
    return await axios.post(url, event);
};

export const retryHealthCheck = async (retries: number = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await healthCheckServices();
        } catch (error) {
            logger.warn(`Health check attempt ${i + 1} failed: ${error.message}`);
            await exponentialBackoff(i);
            if (i === retries - 1) {
                throw new Error('Health check failed after multiple attempts.');
            }
        }
    }
};
