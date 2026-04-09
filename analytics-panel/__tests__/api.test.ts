import request from 'supertest';
import app from '../server';
import { createStrategy } from '../services/strategyService';
import { ServiceError } from '../errors/customErrors';

jest.mock('../services/strategyService');

describe('API Endpoints', () => {
    it('GET /api/performance responds with 200 and performance data', async () => {
        const mockData = { drawdown: [10, 20, 30], maxDrawdown: 30, sharpeRatio: 1.5 };
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(mockData) });

        const response = await request(app).get('/api/performance');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('GET /api/performance handles errors', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new ServiceError('Network error'));

        const response = await request(app).get('/api/performance');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });

    it('GET /api/compare responds with 200 for valid strategies', async () => {
        const mockResult = { betterStrategy: 'A' };
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(mockResult) });

        const response = await request(app)
            .get('/api/compare')
            .query({ strategyA: 'strategyA', strategyB: 'strategyB' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockResult);
    });

    it('GET /api/compare handles empty strategy names', async () => {
        const response = await request(app)
            .get('/api/compare')
            .query({ strategyA: '', strategyB: '' });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error', 'Invalid query parameters. Strategy names must be alphanumeric.');
    });

    it('GET /api/health responds with 200 and health status', async () => {
        const mockHealth = { status: 'ok', uptime: 1000, memoryUsage: process.memoryUsage() };
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({ json: jest.fn().mockResolvedValueOnce(mockHealth) });

        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockHealth);
    });

    it('GET /api/health handles errors', async () => {
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new ServiceError('Health check failed'));

        const response = await request(app).get('/api/health');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
});
