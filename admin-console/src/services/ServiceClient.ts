import axios, { AxiosError } from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';

const BASE_URL = config.API_URL;

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/config`);
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

const updateConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    try {
        await axios.put(`${BASE_URL}/config`, configItem);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to update configuration: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to update configuration');
    }
};

export { fetchConfigurations, postConfiguration, deleteConfiguration, updateConfiguration }; 