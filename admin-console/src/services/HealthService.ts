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

export { healthCheck, fetchHealthStatus };  // Export both functions for use in controllers.