import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { emitEvent } from '../events/EventBus';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
});

const retryWithExponentialBackoff = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
    }
};

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await retryWithExponentialBackoff(() => axiosInstance.get('/config'));
        if (!response.data || !Array.isArray(response.data)) {
            throw new ServiceError('Invalid response: Expected an array');
        }
        return response.data;
    } catch (error) {
        handleAxiosError(error, 'fetch configurations');
    }
};

const postConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    try {
        const response = await retryWithExponentialBackoff(() => axiosInstance.post('/config', configItem));
        emitEvent('CONFIGURATION_CREATED', configItem);
    } catch (error) {
        handleAxiosError(error, 'create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        await retryWithExponentialBackoff(() => axiosInstance.delete(`/config/${key}`));
        emitEvent('CONFIGURATION_DELETED', { key });
    } catch (error) {
        handleAxiosError(error, 'delete configuration');
    }
};

const handleAxiosError = (error: unknown, operation: string) => {
    if (axios.isAxiosError(error)) {
        throw new ServiceError(`Failed to ${operation}: ${error.response?.data?.error || error.message}`);
    }
    throw new ServiceError(`Failed to ${operation}`);
};

export { fetchConfigurations, postConfiguration, deleteConfiguration };