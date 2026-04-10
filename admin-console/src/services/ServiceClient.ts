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
    let errorMessage = `Failed to ${operation}`;
    if (axios.isAxiosError(error)) {
        errorMessage += `: ${error.response?.data?.error || error.message}`;
    }
    throw new ServiceError(errorMessage);
};

export { fetchConfigurations, postConfiguration, deleteConfiguration };  // Export functions for use in the app.