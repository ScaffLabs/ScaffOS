import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';
import { CircuitBreaker } from 'opossum';

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await axios.get(`${config.API_URL}/config`);
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
        await axios.post(`${config.API_URL}/config`, configItem);
    } catch (error) {
        handleAxiosError(error, 'create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    try {
        await axios.delete(`${config.API_URL}/config/${key}`);
    } catch (error) {
        handleAxiosError(error, 'delete configuration');
    }
};

const fetchHealthStatus = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/health`);
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