import axios from 'axios';
import { ValidationError } from './errorClasses';
import config from './config';
import logger from './logger';

const MAX_RETRIES = 3;
const TIMEOUT = 5000;

const createConnectionPool = () => {
    const connections = {};

    const getConnection = (service) => {
        if (!connections[service]) {
            connections[service] = axios.create({
                baseURL: config[`${service.toUpperCase()}_SERVICE_URL`],
                timeout: TIMEOUT
            });
        }
        return connections[service];
    };

    const requestWithRetry = async (service, method, url, data = null, retries = MAX_RETRIES) => {
        try {
            const connection = getConnection(service);
            const response = await connection[method](url, data);
            return response.data;
        } catch (error) {
            logger.error({ error: error.message }, `Error in ${service} connection`);
            if (retries > 0) {
                return requestWithRetry(service, method, url, data, retries - 1);
            }
            throw new ValidationError('Service unavailable after retries.');
        }
    };

    return { getConnection, requestWithRetry, close: () => logger.info('Connection pool closed') };
};

export { createConnectionPool };