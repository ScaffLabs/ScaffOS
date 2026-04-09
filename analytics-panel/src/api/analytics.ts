import axios from 'axios';
import { ServiceError } from '../errors/customErrors';
import { PerformanceMetricsSchema, StrategySchema } from '../types';
import { logError } from '../utils/errorLogger';

const fetchPerformanceMetrics = async () => {
    try {
        const response = await axios.get(`/api/performance`);
        const validatedData = PerformanceMetricsSchema.parse(response.data);
        return validatedData;
    } catch (error) {
        logError(error, 'Fetching performance metrics');
        throw new ServiceError('Failed to fetch performance metrics: ' + error.message);
    }
};

const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    try {
        const response = await axios.get(`/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`);
        return response.data;
    } catch (error) {
        logError(error, 'Comparing strategies');
        throw new ServiceError('Failed to fetch comparison data: ' + error.message);
    }
};

const getStrategies = async () => {
    try {
        const response = await axios.get(`/api/strategies`);
        return response.data;
    } catch (error) {
        logError(error, 'Fetching strategies');
        throw new ServiceError('Failed to fetch strategies: ' + error.message);
    }
};

const createStrategy = async (strategy) => {
    try {
        const response = await axios.post(`/api/strategies`, strategy);
        return response.data;
    } catch (error) {
        logError(error, 'Creating strategy');
        throw new ServiceError('Failed to create strategy: ' + error.message);
    }
};

export { fetchPerformanceMetrics, fetchComparisonData, getStrategies, createStrategy };