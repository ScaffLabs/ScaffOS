import request from 'supertest';
import express from 'express';
import healthRouter from '../health';
import { generateApiKey, validateApiKey } from '../apiKey';

const app = express();
app.use(healthRouter);

describe('API Key Functions and Health Check Endpoint', () => {
    it('should generate and validate an API key', () => {
        const userId = 'user123';
        const apiKey = generateApiKey(userId);
        expect(validateApiKey(apiKey)).toBe(true);
    });

    it('should reject invalid API key', () => {
        expect(validateApiKey('invalid_key')).toBe(false);
    });

    it('should return healthy status', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'healthy' });
    });
});