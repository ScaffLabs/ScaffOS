import { fetchPerformanceMetrics, fetchComparisonData, healthCheck } from '../api/analytics';
import { ServiceError } from '../errors/customErrors';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import request from 'supertest';
import app from '../server';

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

    // Integration tests for API endpoints
    test('GET /api/performance responds with 200 and performance data', async () => {
        const mockData = { drawdown: [10, 20, 30], maxDrawdown: 30, sharpeRatio: 1.5 };
        mock.onGet('/api/performance').reply(200, mockData);

        const response = await request(app).get('/api/performance');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    test('GET /api/compare responds with 200 for valid strategies', async () => {
        const mockResult = { betterStrategy: 'A' };
        mock.onGet('/api/compare?strategyA=strategyA&strategyB=strategyB').reply(200, mockResult);

        const response = await request(app)
            .get('/api/compare')
            .query({ strategyA: 'strategyA', strategyB: 'strategyB' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResult);
    });

    test('GET /api/health responds with 200 and health status', async () => {
        const mockHealth = { status: 'ok', uptime: 1000, memoryUsage: process.memoryUsage() };
        mock.onGet('/api/health').reply(200, mockHealth);

        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockHealth);
    });

    // Edge cases and error handling tests
    test('GET /api/compare handles empty strategy names', async () => {
        const response = await request(app)
            .get('/api/compare')
            .query({ strategyA: '', strategyB: '' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid query parameters. Strategy names must be alphanumeric.');
    });
});
