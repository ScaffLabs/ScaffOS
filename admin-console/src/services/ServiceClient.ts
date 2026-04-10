import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError, InvalidInputTypeError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { emitEvent } from '../events/EventBus';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
    timeout: 5000,
});

const fetchConfigurations = async (limit: number = 10, offset: number = 0, sortBy: string = 'key', order: string = 'asc'): Promise<ConfigurationItem[]> => {
    try {
        const response = await axiosInstance.get('/config', {
            params: { limit, offset, sortBy, order }
        });
        if (!Array.isArray(response.data)) {
            throw new InvalidInputTypeError('Expected an array of configurations.');
        }
        return response.data;
    } catch (error) {
        handleAxiosError(error, 'fetch configurations');
    }
};

const postConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    try {
        const response = await axiosInstance.post('/config', configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        if (response.status !== 201) {
            throw new ServiceError('Failed to create configuration.');
        }
    } catch (error) {
        handleAxiosError(error, 'create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        const response = await axiosInstance.delete(`/config/${key}`);
        emitEvent('CONFIGURATION_DELETED', { key });
        if (response.status !== 204) {
            throw new ServiceError('Failed to delete configuration.');
        }
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

const healthCheckWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axiosInstance.get('/health');
            return response.data;
        } catch (error) {
            if (i === retries - 1) throw new ServiceError('Health check failed: ' + error.message);
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

export { fetchConfigurations, postConfiguration, deleteConfiguration, healthCheckWithRetry };