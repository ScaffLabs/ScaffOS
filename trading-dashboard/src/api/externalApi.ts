import axios from 'axios';
import { retry, circuitBreaker } from '../utils/retry';
import config from '../config';

const BASE_URL = process.env.EXTERNAL_API_URL;

const fetchData = async (endpoint: string) => {
    try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch data from ${endpoint}: ${error.message}`);
    }
};

export const fetchExternalData = circuitBreaker(retry(() => fetchData('/external-data')));

export const fetchServiceHealth = async () => {
    return await fetchData('/health');
};

export const checkServiceHealth = async () => {
    try {
        const health = await fetchServiceHealth();
        return { status: 'UP', health };
    } catch (error) {
        return { status: 'DOWN', error: error.message };
    }
};

export const checkExternalService = async () => {
    try {
        const response = await fetchData('/external-service');
        return response;
    } catch (error) {
        throw new Error(`External service check failed: ${error.message}`);
    }
};

export const healthCheck = async (req, res) => {
    const serviceHealth = await checkServiceHealth();
    const externalServiceHealth = await checkExternalService();
    res.status(serviceHealth.status === 'UP' && externalServiceHealth.status === 'UP' ? 200 : 500).send({
        serviceHealth,
        externalServiceHealth
    });
};
