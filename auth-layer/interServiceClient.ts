import axios from 'axios';
import config from './config';
import logger from './logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 1000; // Base delay in ms
const circuitBreakerTimeout = 10000; // 10 seconds
let isCircuitOpen = false;
let circuitBreakerLastOpen = 0;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string) => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (isCircuitOpen) {
                if (Date.now() - circuitBreakerLastOpen > circuitBreakerTimeout) {
                    isCircuitOpen = false;
                    logger.info('Circuit breaker reset');
                } else {
                    throw new Error('Service temporarily unavailable, circuit is open');
                }
            }
            if (i < MAX_RETRIES - 1) {
                const backoffTime = Math.pow(2, i) * RETRY_DELAY_BASE;
                logger.warn(`Retrying fetch: ${url}, attempt: ${i + 1}`);
                await delay(backoffTime);
            } else {
                logger.error('Final attempt failed', { error: error.message });
                isCircuitOpen = true;
                circuitBreakerLastOpen = Date.now();
                throw new Error('Fetching failed after retries');
            }
        }
    }
};

export const fetchUserData = async (userId: string) => {
    return await fetchWithRetry(`${config.USER_SERVICE_URL}/users/${userId}`);
};

export const sendEvent = async (event: any) => {
    try {
        await axios.post(`${config.EVENT_BUS_URL}/events`, event);
    } catch (error) {
        logger.error('Error sending event', { event, error: error.message });
        throw new Error('Event send failed');
    }
};