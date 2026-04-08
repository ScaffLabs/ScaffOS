import axios from 'axios';
import config from '../config';
import { emitEvent } from '../events/EventBus';
import { EventType, ConfigurationItem } from '../types';
import { ServiceError } from '../errors/CustomErrors';
import { CircuitBreaker } from 'opossum';

const BASE_URL = config.API_URL;

const circuitBreaker = new CircuitBreaker({timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 30000});

const fetchHealthStatus = async () => {
    try {
        const response = await circuitBreaker.fire(axios.get, `${BASE_URL}/health`);
        emitEvent('SERVICE_HEALTH_UPDATED', response.data);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch health status');
    }
};

const postConfiguration = async (key: string, value: string): Promise<ConfigurationItem> => {
    try {
        const response = await circuitBreaker.fire(axios.post, `${BASE_URL}/config`, { key, value });
        const configItem: ConfigurationItem = { key, value };
        emitEvent('CONFIGURATION_CREATED', configItem);
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to create configuration');
    }
};

const requestWithRetry = async (requestFunc: () => Promise<any>, retries = 5, backoff = 300) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await requestFunc();
        } catch (error) {
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, backoff * Math.pow(2, i)));
            } else {
                throw error;
            }
        }
    }
};

const healthCheckWithRetry = async () => {
    return requestWithRetry(fetchHealthStatus);
};

export { fetchHealthStatus, postConfiguration, requestWithRetry, healthCheckWithRetry };