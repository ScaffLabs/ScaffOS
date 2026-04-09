import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { CircuitBreaker } from 'opossum';

const BASE_URL = config.API_URL;

const fetchConfigurationsCircuitBreaker = new CircuitBreaker(fetchConfigurations, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/config`);
        if (!response.data || !Array.isArray(response.data)) {
            throw new ServiceError('Invalid response: Expected an array');
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to fetch configurations: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to fetch configurations');
    }
};

const postConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    try {
        await axios.post(`${BASE_URL}/config`, configItem);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to create configuration: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        await axios.delete(`${BASE_URL}/config/${key}`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to delete configuration: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to delete configuration');
    }
};

const fetchHealthStatus = async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    return response.data;
};

const healthCircuitBreaker = new CircuitBreaker(fetchHealthStatus, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

export const healthCheck = async () => {
    try {
        const result = await healthCircuitBreaker.fire();
        return {
            application: 'running',
            database: result.database,
            externalService: result.externalService
        };
    } catch (error) {
        throw new ServiceError('Health check failed');
    }
};

export { fetchConfigurations, postConfiguration, deleteConfiguration }; 