import axios, { AxiosError } from 'axios';
import EventEmitter from 'eventemitter3';
import config from './config';
import logger from './logger';

const MAX_RETRIES = 3;
const TIMEOUT = 5000;
const circuit = new Map(); // To track circuit breaker states
const serviceEmitter = new EventEmitter();

const createConnectionPool = () => {
    const connections = {};

    const getConnection = (service) => {
        if (!connections[service]) {
            connections[service] = axios.create({
                baseURL: config[`${service.toUpperCase()}_SERVICE_URL`],
                timeout: TIMEOUT,
            });
        }
        return connections[service];
    };

    const requestWithRetry = async (service, method, url, data = null, retries = MAX_RETRIES) => {
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
                await new Promise(resolve => setTimeout(resolve, 200));
                return requestWithRetry(service, method, url, data, retries - 1);
            }
            throw new Error('Service unavailable after retries.');
        }
    };

    return { getConnection, requestWithRetry, serviceEmitter };
};

export { createConnectionPool };