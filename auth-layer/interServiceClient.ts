import axios from 'axios';
import config from './config';
import logger from './logger';

const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const circuitBreaker = {
    isOpen: false,
    failureCount: 0,
    failureThreshold: 5,
    resetTimeout: 30000,
    lastFailure: 0,
};

const fetchWithRetry = async (url: string) => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            if (circuitBreaker.isOpen) {
                const now = Date.now();
                if (now - circuitBreaker.lastFailure < circuitBreaker.resetTimeout) {
                    throw new Error('Circuit breaker is open');
                } else {
                    circuitBreaker.isOpen = false;
                    circuitBreaker.failureCount = 0;
                }
            }
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            circuitBreaker.failureCount++;
            logger.warn(`Fetch failed: ${url}, attempt: ${i + 1}`);
            if (circuitBreaker.failureCount >= circuitBreaker.failureThreshold) {
                circuitBreaker.isOpen = true;
                circuitBreaker.lastFailure = Date.now();
                logger.error('Circuit breaker opened due to failures');
            }
            await delay(Math.pow(2, i) * RETRY_DELAY_BASE);
            if (i === MAX_RETRIES - 1) {
                throw new Error('Fetching failed after retries');
            }
        }
    }
};

export const checkUserServiceHealth = async () => {
    return await fetchWithRetry(`${config.USER_SERVICE_URL}/health`);
};

export const checkOrderServiceHealth = async () => {
    return await fetchWithRetry(`${config.ORDER_SERVICE_URL}/health`);
};

export const fetchUserData = async (userId: string) => {
    return await fetchWithRetry(`${config.USER_SERVICE_URL}/users/${userId}`);
};