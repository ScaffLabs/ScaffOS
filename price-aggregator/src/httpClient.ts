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

export const httpClient = async (path: string, config?: AxiosRequestConfig) => {
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

export const postHttpClient = async (path: string, data: any, config?: AxiosRequestConfig) => {
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

export const checkHealth = async () => {
    try {
        const healthCheck = await httpClient('/health');
        return healthCheck;
    } catch (error) {
        logError(error, { message: 'Health check failed.' });
        throw new Error('Health check failed.');
    }
};