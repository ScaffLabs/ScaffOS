import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError, InvalidInputTypeError } from '../errors/CustomErrors';
import { ConfigurationItem, AppEvent } from '../types';
import { emitEvent } from '../events/EventBus';
import { CircuitBreaker } from 'circuit-breaker-js';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
    timeout: 5000,
});

const circuitBreaker = new CircuitBreaker();

const fetchConfigurations = async (limit = 10, offset = 0, sortBy = 'key', order = 'asc'): Promise<ConfigurationItem[]> => {
    return await circuitBreaker.fire(async () => {
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
    });
};

const postConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    return await circuitBreaker.fire(async () => {
        try {
            const response = await axiosInstance.post('/config', configItem);
            emitEvent({ type: 'CONFIGURATION_CREATED', payload: configItem });
            if (response.status !== 201) {
                throw new ServiceError('Failed to create configuration.');
            }
        } catch (error) {
            handleAxiosError(error, 'create configuration');
        }
    });
};

const deleteConfiguration = async (key: string): Promise<void> => {
    return await circuitBreaker.fire(async () => {
        try {
            const response = await axiosInstance.delete(`/config/${key}`);
            emitEvent({ type: 'CONFIGURATION_DELETED', payload: { key } });
            if (response.status !== 204) {
                throw new ServiceError('Failed to delete configuration.');
            }
        } catch (error) {
            handleAxiosError(error, 'delete configuration');
        }
    });
};

const handleAxiosError = (error: unknown, operation: string) => {
    let errorMessage = `Failed to ${operation}`;
    if (axios.isAxiosError(error)) {
        if (error.response) {
            errorMessage += `: ${error.response.data.error || error.message}`;
            throw new ServiceError(errorMessage);
        }
        errorMessage += `: ${error.message}`;
    }
    throw new ServiceError(errorMessage);
};

const updateConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    return await circuitBreaker.fire(async () => {
        try {
            const response = await axiosInstance.put('/config', configItem);
            emitEvent({ type: 'CONFIGURATION_UPDATED', payload: configItem });
            if (response.status !== 200) {
                throw new ServiceError('Failed to update configuration.');
            }
        } catch (error) {
            handleAxiosError(error, 'update configuration');
        }
    });
};

export { fetchConfigurations, postConfiguration, deleteConfiguration, updateConfiguration };