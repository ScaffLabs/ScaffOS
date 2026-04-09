import axios from 'axios';
import config from '../config';
import { CircuitBreaker } from 'opossum';
import { ServiceError } from '../errors/CustomErrors';

const fetchHealthStatus = async () => {
    const response = await axios.get(`${config.API_URL}/health`);
    return response.data;
};

const healthCircuitBreaker = new CircuitBreaker(fetchHealthStatus, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

const retryWithExponentialBackoff = async (fn, retries = 5, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            return retryWithExponentialBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const healthCheck = async () => {
    try {
        const result = await healthCircuitBreaker.fire();
        return {
            application: 'running',
            database: result.database,
            externalService: result.externalService
        };
    } catch (error) {
        throw new ServiceError('Health check failed: ' + error.message);
    }
};

export const fetchServiceHealthWithRetry = async () => {
    return await retryWithExponentialBackoff(fetchHealthStatus);
};