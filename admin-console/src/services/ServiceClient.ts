import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { CircuitBreaker } from 'opossum';

const BASE_URL = config.API_URL;

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/config`);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch configurations');
    }
};

const postConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    try {
        const response = await axios.post(`${BASE_URL}/config`, configItem);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        await axios.delete(`${BASE_URL}/config/${key}`);
    } catch (error) {
        throw new ServiceError('Failed to delete configuration');
    }
};

const updateConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    try {
        await axios.put(`${BASE_URL}/config`, configItem);
    } catch (error) {
        throw new ServiceError('Failed to update configuration');
    }
};

const healthCircuitBreaker = new CircuitBreaker({
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

const healthCheckService = async () => {
    try {
        const result = await healthCircuitBreaker.fire(fetchHealthStatus);
        return result;
    } catch (error) {
        throw new ServiceError('Health check failed');
    }
};

const fetchHealthStatus = async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    return response.data;
};

export { fetchConfigurations, postConfiguration, deleteConfiguration, updateConfiguration, healthCheckService }; 