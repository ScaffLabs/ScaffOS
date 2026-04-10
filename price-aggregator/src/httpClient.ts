import axios, { AxiosRequestConfig } from 'axios';
import { CircuitBreaker } from 'circuit-breaker-js';
import { logError } from './logger';

const BASE_URL = process.env.BASE_URL || 'https://api.example.com';
const MAX_RETRIES = 3;
const TIMEOUT = 5000; // 5 seconds timeout

const breaker = new CircuitBreaker({
    timeout: TIMEOUT,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
});

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const httpClient = async (path: string, config?: AxiosRequestConfig) => {
    const url = `${BASE_URL}${path}`;
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await breaker.fire(() => axios.get(url, { ...config, timeout: TIMEOUT }));
            return response.data;
        } catch (error) {
            lastError = error;
            logError(error, { message: `Request failed (attempt ${attempt + 1})` });
            await delay(Math.pow(2, attempt) * 1000); // exponential backoff
        }
    }

    throw new Error(`Request failed after ${MAX_RETRIES} attempts: ${lastError}`);
};

const postHttpClient = async (path: string, data: any, config?: AxiosRequestConfig) => {
    const url = `${BASE_URL}${path}`;
    let lastError;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await breaker.fire(() => axios.post(url, data, { ...config, timeout: TIMEOUT }));
            return response.data;
        } catch (error) {
            lastError = error;
            logError(error, { message: `Request failed (attempt ${attempt + 1})` });
            await delay(Math.pow(2, attempt) * 1000); // exponential backoff
        }
    }

    throw new Error(`Request failed after ${MAX_RETRIES} attempts: ${lastError}`);
};

const checkHealth = async () => {
    const services = ['/service1/health', '/service2/health']; // Add your service health paths
    const healthChecks = await Promise.all(services.map(async service => {
        try {
            const result = await httpClient(service);
            return { [service]: result.status };
        } catch (error) {
            return { [service]: 'unhealthy' };
        }
    }));
    return Object.assign({}, ...healthChecks);
};

export { httpClient, postHttpClient, checkHealth };