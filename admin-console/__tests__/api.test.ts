import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import healthRouter from '../src/routes/health';
import configRouter from '../src/routes/config';
import Database from '../src/storage/Database';

const app = express();
const db = new Database();
app.use(bodyParser.json());
app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);

beforeAll(async () => {
    await db.connect(process.env.DATABASE_URL);
});

afterAll(async () => {
    await db.closeConnection();
});

describe('API Endpoints', () => {
    it('GET /api/health returns health status', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('application');
        expect(response.body).toHaveProperty('database');
        expect(response.body).toHaveProperty('externalService');
    });

    it('POST /api/config creates a configuration', async () => {
        const response = await request(app)
            .post('/api/config')
            .send({ key: 'testKey', value: 'testValue' });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Configuration created successfully!' });
    });

    it('POST /api/config returns 400 for invalid body', async () => {
        const response = await request(app).post('/api/config').send({});
        expect(response.status).toBe(400);
    });

    it('GET /api/config/:key returns 200 for existing configuration', async () => {
        await request(app).post('/api/config').send({ key: 'testKey', value: 'testValue' });
        const response = await request(app).get('/api/config/testKey');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ key: 'testKey', value: 'testValue' });
    });

    it('GET /api/config/:key returns 404 for non-existing configuration', async () => {
        const response = await request(app).get('/api/config/nonExistingKey');
        expect(response.status).toBe(404);
    });

    it('PUT /api/config updates an existing configuration', async () => {
        await request(app).post('/api/config').send({ key: 'testKey', value: 'testValue' });
        const response = await request(app)
            .put('/api/config')
            .send({ key: 'testKey', value: 'newValue' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Configuration updated successfully!' });
    });

    it('DELETE /api/config deletes an existing configuration', async () => {
        await request(app).post('/api/config').send({ key: 'testKey', value: 'testValue' });
        const response = await request(app).delete('/api/config/testKey');
        expect(response.status).toBe(204);
    });

    it('DELETE /api/config returns 404 for non-existing configuration', async () => {
        const response = await request(app).delete('/api/config/nonExistingKey');
        expect(response.status).toBe(404);
    });
});
