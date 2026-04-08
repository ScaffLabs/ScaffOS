import axios, { AxiosError } from 'axios';
import { ValidationError } from './errorClasses';
import config from './config';
import logger from './logger';
import EventEmitter from 'eventemitter3';

const MAX_RETRIES = 3;
const TIMEOUT = 5000;
const BACKOFF_FACTOR = 200;
const circuit = new Map(); // To track circuit breaker states
const serviceEmitter = new EventEmitter();

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

    const requestWithRetry = async (service, method, url, data = null, retries = MAX_RETRIES, backoff = BACKOFF_FACTOR) => {
        if (circuit.get(service)) {
            throw new Error('Circuit breaker is open');
        }
        try {
            const connection = getConnection(service);
            const response = await connection[method](url, data);
            return response.data;
        } catch (error) {
            logger.error({ error: error.message }, `Error in ${service} connection`);
            if (error.isAxiosError && error.response) {
                circuit.set(service, true);
                serviceEmitter.emit('circuitOpen', { service });
                setTimeout(() => {
                    circuit.delete(service);
                    serviceEmitter.emit('circuitClosed', { service });
                }, 30000);
            }
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return requestWithRetry(service, method, url, data, retries - 1, backoff * 2);
            }
            throw new ValidationError('Service unavailable after retries.');
        }
    };

    return { getConnection, requestWithRetry, close: () => logger.info('Connection pool closed') };
};

export { createConnectionPool, serviceEmitter };