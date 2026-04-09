import axios from 'axios';
import config from '../config';
import { CircuitBreaker } from 'opossum';

const healthCircuitBreaker = new CircuitBreaker(fetchHealthStatus, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

const fetchHealthStatus = async () => {
    const response = await axios.get(`${config.API_URL}/health`);
    return response.data;
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
        throw new Error('Health check failed');
    }
};
