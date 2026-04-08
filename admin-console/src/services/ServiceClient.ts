import axios from 'axios';
import config from '../config';
import { emitEvent } from '../events/EventBus';

const BASE_URL = config.API_URL;

const retry = async (fn, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
        }
    }
};

const fetchHealthStatus = async () => {
    return retry(async () => {
        const response = await axios.get(`${BASE_URL}/health`);
        emitEvent('SERVICE_HEALTH_UPDATED', response.data);
        return response.data;
    });
};

const postConfiguration = async (key: string, value: string) => {
    return retry(async () => {
        const response = await axios.post(`${BASE_URL}/config`, { key, value });
        emitEvent('CONFIGURATION_CREATED', { key, value });
        return response.data;
    });
};

export { fetchHealthStatus, postConfiguration };