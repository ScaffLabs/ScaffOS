import axios from 'axios';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

const eventBus = new EventEmitter();
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const exponentialBackoff = (retries) => {
    return Math.pow(2, retries) * RETRY_DELAY;
};

const fetchWithRetry = async (url, config, retries = 0) => {
    try {
        const response = await axiosInstance.get(url, config);
        return response.data;
    } catch (error) {
        if (retries < MAX_RETRIES) {
            const delay = exponentialBackoff(retries);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, config, retries + 1);
        }
        console.error('Request failed:', error);
        throw new Error('Request failed');
    }
};

export const fetchPerformanceMetrics = () => fetchWithRetry('/api/performance');

export const fetchComparisonData = (strategyA, strategyB) => 
    fetchWithRetry('/api/compare', { params: { strategyA, strategyB }});

export const healthCheck = async () => {
    return fetchWithRetry('/api/health');
};

export const getStrategies = () => fetchWithRetry('/api/strategies');

export const emitEvent = (eventName, data) => {
    eventBus.emit(eventName, data);
};

export const subscribeToEvent = (eventName, listener) => {
    eventBus.on(eventName, listener);
};

export const monitorMemoryUsage = () => {
    setInterval(() => {
        const memoryUsage = process.memoryUsage();
        console.log('Memory Usage:', memoryUsage);
    }, 60000);
};

monitorMemoryUsage();
