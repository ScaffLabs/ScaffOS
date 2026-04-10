import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError, InvalidInputTypeError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';

const axiosInstance = axios.create({
    baseURL: config.API_URL,
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

export { fetchConfigurations, postConfiguration, deleteConfiguration };