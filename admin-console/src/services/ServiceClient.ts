import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError, InvalidInputTypeError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
    timeout: 5000,
});

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await axiosInstance.get('/config');
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

const fetchHealthStatus = async () => {
    try {
        const response = await axiosInstance.get('/health');
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch health status: ' + error.message);
    }
};

const healthCheck = async () => {
    try {
        const result = await fetchHealthStatus();
        return {
            application: 'running',
            database: result.database,
            externalService: result.externalService
        };
    } catch (error) {
        throw new ServiceError('Health check failed: ' + error.message);
    }
};

export { fetchConfigurations, postConfiguration, deleteConfiguration, fetchHealthStatus, healthCheck };