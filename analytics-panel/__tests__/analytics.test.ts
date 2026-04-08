import { fetchPerformanceMetrics, fetchComparisonData, healthCheck } from '../api/analytics';
import { ServiceError } from '../errors/customErrors';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

describe('Analytics API', () => {
    beforeEach(() => {
        mock.reset();
    });

    test('fetchPerformanceMetrics returns data', async () => {
        const mockData = { drawdown: [10, 20, 30], maxDrawdown: 30, sharpeRatio: 1.5 };
        mock.onGet('/api/performance').reply(200, mockData);

        const data = await fetchPerformanceMetrics();
        expect(data).toEqual(mockData);
    });

    test('fetchPerformanceMetrics handles network errors', async () => {
        mock.onGet('/api/performance').reply(500);

        await expect(fetchPerformanceMetrics()).rejects.toThrow(ServiceError);
    });

    test('fetchComparisonData returns comparison result', async () => {
        const mockResult = { betterStrategy: 'A' };
        mock.onGet('/api/compare').reply(200, mockResult);

        const result = await fetchComparisonData('strategyA', 'strategyB');
        expect(result).toEqual(mockResult);
    });

    test('fetchComparisonData handles errors', async () => {
        mock.onGet('/api/compare').reply(400);

        await expect(fetchComparisonData('strategyA', 'strategyB')).rejects.toThrow(ServiceError);
    });

    test('healthCheck returns health status', async () => {
        const mockHealth = { status: 'ok', uptime: 1000, memoryUsage: process.memoryUsage() };
        mock.onGet('/api/health').reply(200, mockHealth);

        const health = await healthCheck();
        expect(health).toEqual(mockHealth);
    });

    test('healthCheck handles errors', async () => {
        mock.onGet('/api/health').reply(500);

        await expect(healthCheck()).rejects.toThrow(ServiceError);
    });

    test('fetchComparisonData handles empty strategy names', async () => {
        mock.onGet('/api/compare').reply(400);

        await expect(fetchComparisonData('', '')).rejects.toThrow(ServiceError);
    });

    test('healthCheck includes memory usage', async () => {
        const mockHealth = { status: 'ok', uptime: 1000, memoryUsage: { rss: 100000, heapTotal: 200000, heapUsed: 150000 } };
        mock.onGet('/api/health').reply(200, mockHealth);

        const health = await healthCheck();
        expect(health.memoryUsage).toHaveProperty('rss');
        expect(health.memoryUsage).toHaveProperty('heapTotal');
        expect(health.memoryUsage).toHaveProperty('heapUsed');
    });

    test('fetchPerformanceMetrics handles invalid data', async () => {
        mock.onGet('/api/performance').reply(200, { invalidField: 'data' });

        await expect(fetchPerformanceMetrics()).rejects.toThrow(ServiceError);
    });
});