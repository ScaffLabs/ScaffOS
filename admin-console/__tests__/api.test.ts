import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import config from '../src/config';
import healthRouter from '../src/routes/health';

const app = express();
app.use(bodyParser.json());
app.use('/api/health', healthRouter);

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

    it('GET /api/health returns 500 on failure', async () => {
        // Mocking behavior to simulate a server failure
        jest.spyOn(healthRouter, 'get').mockImplementationOnce((req, res) => {
            res.status(500).send();
        });

        const response = await request(app).get('/api/health');
        expect(response.status).toBe(500);
    });
});