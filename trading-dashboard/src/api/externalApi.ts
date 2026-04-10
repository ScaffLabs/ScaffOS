import axios from 'axios';
import { ServiceError } from '../utils/errors';
import config from '../config';
import { retry, circuitBreaker } from '../utils/retry';

const BASE_URL = config.externalApiUrl;

const fetchExternalDataRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await axios.get(`${BASE_URL}/data`, { signal: controller.signal });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            throw new ServiceError('Fetch external data request timed out.');
        }
        throw new ServiceError('Error fetching external data: ' + error.message);
    } finally {
        clearTimeout(timeoutId);
    }
};

const fetchServiceHealthRequest = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
        const response = await axios.get(`${BASE_URL}/health`, { signal: controller.signal });
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) {
            throw new ServiceError('Fetch service health request timed out.');
        }
        throw new ServiceError('Error fetching service health: ' + error.message);
    } finally {
        clearTimeout(timeoutId);
    }
};

export const fetchExternalData = circuitBreaker(retry(fetchExternalDataRequest));
export const fetchServiceHealth = circuitBreaker(retry(fetchServiceHealthRequest));

export const registerExternalApiRoutes = (app: any) => {
    app.get('/api/external/data', async (req, res) => {
        try {
            const data = await fetchExternalData();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });

    app.get('/api/external/health', async (req, res) => {
        try {
            const health = await fetchServiceHealth();
            res.status(200).json(health);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    });
};