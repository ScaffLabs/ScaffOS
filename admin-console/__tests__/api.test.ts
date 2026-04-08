import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import config from '../src/config';

const app = express();
app.use(bodyParser.json());
app.get('/api/health', (req, res) => {
    res.status(200).json({ service: 'running' });
});
app.post('/api/config', (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).send('Invalid input');
    res.status(201).send('Configuration created');
});

describe('API Endpoints', () => {
    it('GET /api/health returns health status', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ service: 'running' });
    });

    it('POST /api/config creates a configuration', async () => {
        const response = await request(app).post('/api/config').send({ key: 'testKey', value: 'testValue' });
        expect(response.status).toBe(201);
        expect(response.text).toBe('Configuration created');
    });

    it('POST /api/config returns 400 for invalid body', async () => {
        const response = await request(app).post('/api/config').send({});
        expect(response.status).toBe(400);
    });
});