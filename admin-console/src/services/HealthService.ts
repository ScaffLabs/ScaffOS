import axios from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';

const fetchHealthStatus = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/health`);
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

const healthCheckWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await healthCheck();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

export { healthCheckWithRetry, fetchHealthStatus };  // Export both functions for use in controllers.