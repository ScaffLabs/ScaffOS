import axios from 'axios';
import { ServiceError } from '../errors/customErrors';
import { PerformanceMetricsSchema } from '../types';
import { logError } from '../utils/errorLogger';
import { emitEvent } from '../api/eventBus';

const fetchPerformanceMetrics = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/performance`);
        const validatedData = PerformanceMetricsSchema.parse(response.data);
        emitEvent('PERFORMANCE_METRICS_FETCHED', validatedData);
        return validatedData;
    } catch (error) {
        logError(error, 'Fetching performance metrics');
        throw new ServiceError('Failed to fetch performance metrics: ' + error.message);
    }
};

const fetchComparisonData = async (strategyA: string, strategyB: string) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/compare?strategyA=${strategyA}&strategyB=${strategyB}`);
        return response.data;
    } catch (error) {
        logError(error, 'Comparing strategies');
        throw new ServiceError('Failed to fetch comparison data: ' + error.message);
    }
};

const healthCheckDependentServices = async () => {
    const dependencies = [
        { name: 'Strategy Service', url: process.env.STRATEGY_SERVICE_URL },
    ];

    const healthResults = await Promise.all(dependencies.map(async (service) => {
        try {
            const response = await axios.get(service.url);
            return { serviceName: service.name, healthy: response.status === 200 };
        } catch (error) {
            return { serviceName: service.name, healthy: false };
        }
    }));

    return healthResults;
};

export { fetchPerformanceMetrics, fetchComparisonData, healthCheckDependentServices };