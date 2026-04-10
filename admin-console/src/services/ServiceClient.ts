import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { CircuitBreaker } from 'opossum';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
});

const circuitBreakerOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000,
};

const circuitBreaker = new CircuitBreaker(axiosInstance, circuitBreakerOptions);

const retryWithExponentialBackoff = async (fn, retries = 5, delay = 1000) => {
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
        const response = await retryWithExponentialBackoff(() => circuitBreaker.fire('/config'));
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
        await retryWithExponentialBackoff(() => circuitBreaker.fire('/config', { method: 'POST', data: configItem }));
    } catch (error) {
        handleAxiosError(error, 'create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        await retryWithExponentialBackoff(() => circuitBreaker.fire(`/config/${key}`, { method: 'DELETE' }));
    } catch (error) {
        handleAxiosError(error, 'delete configuration');
    }
};

const fetchHealthStatus = async () => {
    try {
        const response = await retryWithExponentialBackoff(() => circuitBreaker.fire('/health'));
        return response.data;
    } catch (error) {
        handleAxiosError(error, 'fetch health status');
    }
};

const handleAxiosError = (error: unknown, operation: string) => {
    if (axios.isAxiosError(error)) {
        throw new ServiceError(`Failed to ${operation}: ${error.response?.data?.error || error.message}`);
    }
    throw new ServiceError(`Failed to ${operation}`);
};

export { fetchConfigurations, postConfiguration, deleteConfiguration, fetchHealthStatus };