import axios from 'axios';
import config from './config';
import logger from './logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_BASE = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string) => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(url, { timeout: 5000 }); // Set timeout for the request
            return response.data;
        } catch (error) {
            if (i < MAX_RETRIES - 1) {
                const backoffTime = Math.pow(2, i) * RETRY_DELAY_BASE;
                logger.warn(`Retrying fetch: ${url}, attempt: ${i + 1}`);
                await delay(backoffTime);
            } else {
                logger.error('Final attempt failed', { error: error.message });
                throw new Error('Fetching failed after retries');
            }
        }
    }
};

export const fetchUserData = async (userId: string) => {
    return await fetchWithRetry(`${config.USER_SERVICE_URL}/users/${userId}`);
};

export const checkServiceHealth = async (url: string) => {
    try {
        await fetchWithRetry(url);
        return true;
    } catch (error) {
        logger.error(`Service health check failed for ${url}: ${error.message}`);
        return false;
    }
};