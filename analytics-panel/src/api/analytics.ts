import axios from 'axios';
import { ServiceError } from '../errors/customErrors';
import { emitEvent } from './eventBus';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const axiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 5000 });

const fetchWithRetry = async (url: string, config?: any, retries: number = 0) => {
    try {
        const response = await axiosInstance.get(url, config);
        return response.data;
    } catch (error) {
        if (retries < 3) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            return fetchWithRetry(url, config, retries + 1);
        }
        throw new ServiceError('Failed to fetch data: ' + error.message);
    }
};

export const fetchPerformanceMetrics = async () => {
    const data = await fetchWithRetry('/api/performance');
    emitEvent('performanceMetricsFetched', data);
    return data;
};

export const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    return await fetchWithRetry('/api/compare', { params: { strategyA, strategyB }});
};

export const healthCheck = async () => {
    return await fetchWithRetry('/api/health');
};

export const dependentHealthCheck = async () => {
    const services = {
        strategyService: process.env.STRATEGY_SERVICE_URL,
    };
    const healthResults = await Promise.all(Object.entries(services).map(async ([name, url]) => {
        try {
            const response = await axios.get(url);
            return { serviceName: name, healthy: response.status === 200 };
        } catch {
            return { serviceName: name, healthy: false };
        }
    }));
    return healthResults;
};

export const getStrategies = async () => {
    return await fetchWithRetry('/api/strategies');
};