import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { CircuitBreaker } from 'opossum';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
});

const circuitBreakerOptions = {
    timeout: 3000, // If the service takes longer than 3 seconds, it will be considered failed
    errorThresholdPercentage: 50, // If 50% of requests fail, the circuit will trip
    resetTimeout: 10000, // After 10 seconds, it will try again
};

const circuitBreaker = new CircuitBreaker(axiosInstance, circuitBreakerOptions);

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await circuitBreaker.fire('/config');
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
        await circuitBreaker.fire('/config', { method: 'POST', data: configItem });
    } catch (error) {
        handleAxiosError(error, 'create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        await circuitBreaker.fire(`/config/${key}`, { method: 'DELETE' });
    } catch (error) {
        handleAxiosError(error, 'delete configuration');
    }
};

const fetchHealthStatus = async () => {
    try {
        const response = await circuitBreaker.fire('/health');
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