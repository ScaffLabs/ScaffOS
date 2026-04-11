import axios from 'axios';
import config from '../config';
import { ServiceError } from '../errors/CustomErrors';

const fetchHealthStatus = async () => {
    try {
        const response = await axios.get(`${config.API_URL}/health`, { timeout: 5000 });
        return response.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch health status: ' + error.message);
    }
};

const checkDatabaseConnection = async () => {
    try {
        // Simulated database connection check
        const result = await axios.get(`${config.DATABASE_URL}/health`);
        return result.status === 200;
    } catch (error) {
        return false;
    }
};

const healthCheckWithRetry = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const status = await fetchHealthStatus();
            return {
                application: status.application,
                database: await checkDatabaseConnection() ? 'up' : 'down',
                externalService: status.externalService
            };
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

export { healthCheckWithRetry, fetchHealthStatus, checkDatabaseConnection };