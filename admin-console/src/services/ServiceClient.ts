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

const healthCheckWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axiosInstance.get('/health');
            if (response.status === 200) {
                return { status: 'up' };
            }
        } catch (error) {
            if (i === retries - 1) throw new ServiceError('Health check failed: ' + error.message);
            await new Promise(res => setTimeout(res, delay));
        }
    }
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

export { fetchConfigurations, postConfiguration, deleteConfiguration, healthCheckWithRetry };