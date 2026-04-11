import axios from 'axios';
import logger from './logger';
import config from './config';

const exponentialBackoff = (retries: number) => {
    return new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 100));
};

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000;
let failureCount = 0;
let isCircuitOpen = false;
let circuitBreakerTimeout: NodeJS.Timeout;

const fetchWithRetry = async (url: string, retries: number = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            failureCount = 0; // Reset on success
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
        return data;
    } catch (error) {
        failureCount++;
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