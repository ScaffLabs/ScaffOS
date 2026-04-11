import request from 'supertest';
import express from 'express';
import { healthCheck } from '../healthCheck';
import errorMiddleware from '../errorMiddleware';

const app = express();
app.get('/health', healthCheck);
app.use(errorMiddleware);

describe('Health Check Endpoint Tests', () => {
    it('should return service status UP', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'UP');
    });

    it('should return memory usage metrics', async () => {
        const response = await request(app).get('/health');
        expect(response.body.memory).toHaveProperty('total');
        expect(response.body.memory).toHaveProperty('used');
        expect(response.body.memory).toHaveProperty('heapTotal');
        expect(response.body.memory).toHaveProperty('heapUsed');
    });

    it('should return DOWN status if any service is down', async () => {
        jest.spyOn(global, 'fetch').mockResolvedValueOnce({ status: 503 });
        const response = await request(app).get('/health');
        expect(response.status).toBe(503);
        expect(response.body).toHaveProperty('status', 'DOWN');
    });

    it('should handle unexpected errors gracefully', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const faultyHealthCheck = (req, res) => { throw new Error('Unexpected error'); };
        app.get('/health', faultyHealthCheck);
        const response = await request(app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });
});