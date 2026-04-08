import request from 'supertest';
import express from 'express';
import { healthCheck } from '../healthCheck';

const app = express();
app.get('/health', healthCheck);

describe('Health Check Endpoint', () => {
    it('should return status UP', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'UP' });
    });

    it('should handle unexpected errors', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        // Simulating an unexpected error by throwing an error in healthCheck
        const faultyHealthCheck = (req, res) => { throw new Error('Unexpected error'); };
        app.get('/health', faultyHealthCheck);

        const response = await request(app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });

    it('should handle health check with service down', async () => {
        const faultyHealthCheck = (req, res) => {
            res.status(500).json({ error: 'Service Unavailable' });
        };
        app.get('/health', faultyHealthCheck);

        const response = await request(app).get('/health');
        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Service Unavailable');
    });
});
