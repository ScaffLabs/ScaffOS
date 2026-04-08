import request from 'supertest';
import express from 'express';
import healthRouter from '../health';

const app = express();
app.use(healthRouter);

describe('Health Check Endpoint', () => {
    it('should return healthy status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'healthy' });
    });

    it('should return unhealthy status if user service is down', async () => {
        jest.mock('../interServiceClient', () => ({ checkServiceHealth: jest.fn().mockResolvedValue(false) }));
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('unhealthy');
    });

    it('should handle errors gracefully', async () => {
        jest.mock('../interServiceClient', () => ({ checkServiceHealth: jest.fn().mockRejectedValue(new Error('Service error')) }));
        const res = await request(app).get('/health');
        expect(res.status).toBe(500);
        expect(res.body.status).toBe('unhealthy');
    });
});