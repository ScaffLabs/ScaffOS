import axios from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';
import { ConfigurationItem } from '../types';

const BASE_URL = config.API_URL;

const fetchConfigurations = async (): Promise<ConfigurationItem[]> => {
    try {
        const response = await axios.get(`${BASE_URL}/config`);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch configurations');
    }
};

const postConfiguration = async (key: string, value: string): Promise<ConfigurationItem> => {
    const configItem: ConfigurationItem = { key, value };
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

export { fetchConfigurations, postConfiguration, deleteConfiguration };