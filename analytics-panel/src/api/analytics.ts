import axios from 'axios';
import { ServiceError } from '../errors/customErrors';
import { PerformanceMetrics, PerformanceMetricsSchema, Strategy, StrategySchema } from '../types';
import { emitEvent } from './eventBus';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const axiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 5000 });

const fetchWithRetry = async (url: string, options: any, retries: number = 3) => {
    try {
        return await axiosInstance(url, options);
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying ${url}, attempts left: ${retries}`);
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
};

const fetchPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    try {
        const response = await fetchWithRetry('/api/performance', { method: 'GET' });
        const validationResult = PerformanceMetricsSchema.safeParse(response.data);
        if (!validationResult.success) {
            throw new ServiceError('Invalid performance metrics data');
        }
        emitEvent('PERFORMANCE_METRICS_FETCHED', validationResult.data);
        return validationResult.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch performance metrics: ' + error.message);
    }
};

const getStrategies = async (): Promise<Strategy[]> => {
    try {
        const response = await fetchWithRetry('/api/strategies', { method: 'GET' });
        const strategies = response.data;
        strategies.forEach(strategy => {
            const validationResult = StrategySchema.safeParse(strategy);
            if (!validationResult.success) {
                throw new ServiceError('Invalid strategy data');
            }
        });
        return strategies;
    } catch (error) {
        throw new ServiceError('Failed to fetch strategies: ' + error.message);
    }
};

export { fetchPerformanceMetrics, getStrategies };