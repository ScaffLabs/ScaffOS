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
});
