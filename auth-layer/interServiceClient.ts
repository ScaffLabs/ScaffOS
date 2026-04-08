import axios from 'axios';
import config from './config';
import logger from './logger';

const baseURL = config.BASE_URL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, retries: number = MAX_RETRIES) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (i < retries - 1) {
                logger.warn(`Retrying fetch: ${url}, attempt: ${i + 1}`);
                await delay(RETRY_DELAY);
            } else {
                logger.error('Final attempt failed', { error: error.message });
                throw new Error('Fetching failed after retries');
            }
        }
    }
};

export const fetchUserData = async (userId: string) => {
    return await fetchWithRetry(`${baseURL}/users/${userId}`);
};

export const sendEvent = async (event: any) => {
    try {
        await axios.post(`${baseURL}/events`, event);
    } catch (error) {
        logger.error('Error sending event', { event, error: error.message });
        throw new Error('Event send failed');
    }
};