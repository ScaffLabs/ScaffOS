import axios from 'axios';
import config from '../config';
import { emitEvent } from '../events/EventBus';
import { EventType, ConfigurationItem } from '../types';
import { ServiceError } from '../errors/CustomErrors';

const BASE_URL = config.API_URL;

const fetchHealthStatus = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        emitEvent('SERVICE_HEALTH_UPDATED', response.data);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch health status');
    }
};

const postConfiguration = async (key: string, value: string): Promise<ConfigurationItem> => {
    try {
        const response = await axios.post(`${BASE_URL}/config`, { key, value });
        const configItem: ConfigurationItem = { key, value };
        emitEvent('CONFIGURATION_CREATED', configItem);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to create configuration');
    }
};

export { fetchHealthStatus, postConfiguration };