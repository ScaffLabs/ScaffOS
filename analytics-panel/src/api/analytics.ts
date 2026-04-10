import axios from 'axios';
import { ServiceError, ValidationError } from '../errors/customErrors';
import { PerformanceMetricsSchema } from '../types';
import { logError } from '../utils/errorLogger';
import { emitEvent } from './eventBus';
import { CircuitBreaker } from 'opossum';

const fetchWithRetry = async (url: string, retries: number = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (i === retries - 1) throw error; // Rethrow last error
            console.warn(`Retrying ${url}, attempt ${i + 1}`);
        }
    }
};

const circuitBreaker = new CircuitBreaker(fetchWithRetry, {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
});

const fetchPerformanceMetrics = async () => {
    try {
        const response = await circuitBreaker.fire(`${process.env.REACT_APP_API_BASE_URL}/api/performance`);
        const validatedData = PerformanceMetricsSchema.parse(response);
        emitEvent('PERFORMANCE_METRICS_FETCHED', validatedData);
        return validatedData;
    } catch (error) {
        logError(error, 'Fetching performance metrics');
        if (error instanceof ValidationError) {
            throw new ServiceError('Validation failed: ' + error.message);
        }
        throw new ServiceError('Failed to fetch performance metrics: ' + error.message);
    }
};

const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    try {
        if (!strategyA || !strategyB) {
            throw new ValidationError('Both strategies must be defined.');
        }
        const response = await circuitBreaker.fire(`${process.env.REACT_APP_API_BASE_URL}/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`);
        emitEvent('STRATEGY_COMPARISON_RESULT', response);
        return response;
    } catch (error) {
        logError(error, 'Comparing strategies');
        if (error instanceof ValidationError) {
            throw new ServiceError('Validation failed: ' + error.message);
        }
        throw new ServiceError('Failed to fetch comparison data: ' + error.message);
    }
};

const fetchStrategies = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/strategies`);
        return response.data;
    } catch (error) {
        logError(error, 'Fetching strategies');
        throw new ServiceError('Failed to fetch strategies: ' + error.message);
    }
};

export { fetchPerformanceMetrics, fetchComparisonData, fetchStrategies };