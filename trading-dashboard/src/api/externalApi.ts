import axios from 'axios';
import { retry, circuitBreaker } from '../utils/retry';
import config from '../config';
import { ServiceError } from '../utils/errors';
import { checkServiceHealth } from './healthCheck';

const BASE_URL = process.env.EXTERNAL_API_URL;

const fetchData = async (endpoint: string) => {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        return response.data;
    } catch (error) {
        throw new ServiceError(`Failed to fetch data from ${endpoint}: ${error.message}`);
    }
};

export const fetchExternalData = circuitBreaker(retry(() => fetchData('/external-data')));

export const fetchServiceHealth = async () => {
    return await fetchData('/health');
};

export const checkExternalServiceHealth = async () => {
    try {
        const health = await fetchServiceHealth();
        return { status: 'UP', health };
    } catch (error) {
        return { status: 'DOWN', error: error.message };
    }
};

export const healthCheck = async (req, res) => {
    const serviceHealth = await checkServiceHealth();
    const externalServiceHealth = await checkExternalServiceHealth();
    res.status(serviceHealth.status === 'UP' && externalServiceHealth.status === 'UP' ? 200 : 500).send({
        serviceHealth,
        externalServiceHealth
    });
};