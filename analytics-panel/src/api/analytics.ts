import axios from 'axios';
import { ServiceError, ValidationError } from '../errors/customErrors';
import { PerformanceMetricsSchema, StrategySchema } from '../types';
import { logError } from '../utils/errorLogger';
import CircuitBreaker from '../utils/circuitBreaker';

const circuitBreaker = new CircuitBreaker();

const fetchPerformanceMetrics = async () => {
    try {
        const response = await circuitBreaker.execute(() =>
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/performance`)
        );
        const validatedData = PerformanceMetricsSchema.parse(response.data);
        return validatedData;
    } catch (error) {
        logError(error, 'Fetching performance metrics');
        throw new ServiceError('Failed to fetch performance metrics: ' + error.message);
    }
};

const createStrategy = async (strategy) => {
    try {
        const response = await circuitBreaker.execute(() =>
            axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/strategies`, strategy)
        );
        return StrategySchema.parse(response.data);
    } catch (error) {
        logError(error, 'Creating strategy');
        throw new ServiceError('Failed to create strategy: ' + error.message);
    }
};

const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    if (!strategyA || !strategyB) {
        throw new ValidationError('Both strategies must be defined.');
    }
    try {
        const response = await circuitBreaker.execute(() =>
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`)
        );
        return response.data;
    } catch (error) {
        logError(error, 'Comparing strategies');
        throw new ServiceError('Failed to fetch comparison data: ' + error.message);
    }
};

const healthCheck = async () => {
    try {
        const response = await circuitBreaker.execute(() =>
            axios.get(`${process.env.STRATEGY_SERVICE_URL}`)
        );
        return response.data;
    } catch (error) {
        logError(error, 'Health check');
        throw new ServiceError('Health check failed: ' + error.message);
    }
};

export { fetchPerformanceMetrics, fetchComparisonData, healthCheck, createStrategy };