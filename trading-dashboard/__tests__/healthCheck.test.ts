import request from 'supertest';
import app from '../src/server';

describe('Health Check API', () => {
    it('GET /api/health should return 200 and service status', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status');
        expect(response.body.status).toBe('UP');
    });

    it('GET /api/health should return 500 if external service is down', async () => {
        jest.mock('../src/api/externalApi', () => ({
            fetchServiceHealth: jest.fn(() => Promise.reject(new Error('Service not available')))
        }));
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
    });
});