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
});
