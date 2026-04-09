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
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to fetch configurations: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to fetch configurations');
    }
};

const postConfiguration = async (configItem: ConfigurationItem): Promise<void> => {
    const circuitBreaker = new CircuitBreaker(async () => {
        await axios.post(`${config.API_URL}/config`, configItem);
    }, {
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
    });
    try {
        await circuitBreaker.fire();
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to create configuration: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to create configuration');
    }
};

const deleteConfiguration = async (key: string): Promise<void> => {
    const circuitBreaker = new CircuitBreaker(async () => {
        await axios.delete(`${config.API_URL}/config/${key}`);
    }, {
        timeout: 3000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000,
    });
    try {
        await circuitBreaker.fire();
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new ServiceError(`Failed to delete configuration: ${error.response?.data?.error || error.message}`);
        }
        throw new ServiceError('Failed to delete configuration');
    }
};

const fetchHealthStatus = async () => {
    const response = await axios.get(`${config.API_URL}/health`);
    return response.data;
};

const healthCircuitBreaker = new CircuitBreaker(fetchHealthStatus, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

export { fetchConfigurations, postConfiguration, deleteConfiguration, fetchHealthStatus, healthCircuitBreaker };