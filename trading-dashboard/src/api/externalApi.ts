import axios from 'axios';
import { ServiceError } from '../utils/errors';
import config from '../config';
import { retry, circuitBreaker } from '../utils/retry';
import { publishEvent } from '../utils/eventBus';

const BASE_URL = config.externalApiUrl;

const fetchExternalDataRequest = async () => {
    const response = await axios.get(`${BASE_URL}/data`);
    return response.data;
};

const fetchServiceHealthRequest = async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    return response.data;
};

export const fetchExternalData = circuitBreaker(retry(fetchExternalDataRequest));
export const fetchServiceHealth = circuitBreaker(retry(fetchServiceHealthRequest));

export const healthCheck = async (req, res) => {
    try {
        const health = await fetchServiceHealth();
        res.status(health.status === 'UP' ? 200 : 500).send(health);
    } catch (error) {
        throw new ServiceError(`Failed to fetch health status: ${error.message}`);
    }
};

export const registerExternalApiRoutes = (app) => {
    app.get('/api/external/health', healthCheck);
};

export const notifyExternalData = async (data) => {
    publishEvent('EXTERNAL_DATA_RECEIVED', data);
};

export const subscribeToExternalData = (listener) => {
    eventBus.on('EXTERNAL_DATA_RECEIVED', listener);
};

export const unsubscribeFromExternalData = (listener) => {
    eventBus.off('EXTERNAL_DATA_RECEIVED', listener);
};