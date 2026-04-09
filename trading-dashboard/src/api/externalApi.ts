import axios from 'axios';
import { ServiceError } from '../utils/errors';
import config from '../config';

const BASE_URL = config.externalApiUrl;

export const fetchExternalData = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/data`);
        return response.data;
    } catch (error) {
        throw new ServiceError(`Failed to fetch external data: ${error.message}`);
    }
};

export const fetchServiceHealth = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        return response.data;
    } catch (error) {
        throw new ServiceError(`Failed to fetch external service health: ${error.message}`);
    }
};

export const healthCheck = async (req, res) => {
    try {
        const health = await fetchServiceHealth();
        res.status(health.status === 'UP' ? 200 : 500).send(health);
    } catch (error) {
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

export const registerExternalApiRoutes = (app) => {
    app.get('/api/external/health', healthCheck);
};