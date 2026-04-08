import axios from 'axios';
import { ServiceError } from '../errors/customErrors';
import { PerformanceMetrics, PerformanceMetricsSchema, Strategy, StrategySchema } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
const axiosInstance = axios.create({ baseURL: API_BASE_URL, timeout: 5000 });

const fetchPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
    try {
        const response = await axiosInstance.get('/api/performance');
        const validationResult = PerformanceMetricsSchema.safeParse(response.data);
        if (!validationResult.success) {
            throw new ServiceError('Invalid performance metrics data');
        }
        return validationResult.data;
    } catch (error) {
        throw new ServiceError('Failed to fetch performance metrics: ' + error.message);
    }
};

const getStrategies = async (): Promise<Strategy[]> => {
    try {
        const response = await axiosInstance.get('/api/strategies');
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