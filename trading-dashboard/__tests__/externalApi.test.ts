import request from 'supertest';
import app from '../src/server';
import { fetchExternalData, fetchServiceHealth } from '../src/api/externalApi';
import { jest } from '@jest/globals';

jest.mock('../src/api/externalApi');

describe('External API Endpoints', () => {
    it('GET /api/external/health should return service health', async () => {
        (fetchServiceHealth as jest.Mock).mockResolvedValue({ status: 'UP' });
        const response = await request(app).get('/api/external/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'UP' });
    });

    it('GET /api/external/data should return external data', async () => {
        (fetchExternalData as jest.Mock).mockResolvedValue([{ id: '1', value: 'data' }]);
        const response = await request(app).get('/api/external/data');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: '1', value: 'data' }]);
    });

    it('GET /api/external/data should return 500 on fetch error', async () => {
        (fetchExternalData as jest.Mock).mockRejectedValue(new Error('Fetch error'));
        const response = await request(app).get('/api/external/data');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error fetching external data' });
    });

    it('GET /api/external/health should return 500 on health check error', async () => {
        (fetchServiceHealth as jest.Mock).mockRejectedValue(new Error('Health check error'));
        const response = await request(app).get('/api/external/health');
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Error checking external service health' });
    });
});