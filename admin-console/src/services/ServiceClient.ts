import axios from 'axios';
import config from '../config';
import { emitEvent } from '../events/EventBus';
import { EventType, ConfigurationItem } from '../types';

const BASE_URL = config.API_URL;

const retry = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

const fetchHealthStatus = async () => {
    return retry(async () => {
        const response = await axios.get(`${BASE_URL}/health`);
        emitEvent('SERVICE_HEALTH_UPDATED', response.data);
        return response.data;
    }, 5, 1000);
};

const postConfiguration = async (key: string, value: string): Promise<ConfigurationItem> => {
    return retry(async () => {
        const response = await axios.post(`${BASE_URL}/config`, { key, value });
        const configItem: ConfigurationItem = { key, value };
        emitEvent('CONFIGURATION_CREATED', configItem);
        return response.data;
    }, 3, 500);
};

export { fetchHealthStatus, postConfiguration };