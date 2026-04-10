import axios from 'axios';
import { ServiceError, ValidationError } from '../errors/customErrors';
import { PerformanceMetricsSchema } from '../types';
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

export { fetchPerformanceMetrics, fetchComparisonData };