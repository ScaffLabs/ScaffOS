import request from 'supertest';
import express from 'express';
import { healthCheck } from '../healthCheck';
import { listDashboardEntries, createDashboardEntry, updateDashboardEntry, deleteDashboardEntry } from '../dashboard';
import errorMiddleware from '../errorMiddleware';

const app = express();
app.use(express.json());
app.get('/health', healthCheck);
app.get('/dashboard', listDashboardEntries);
app.post('/dashboard', createDashboardEntry);
app.put('/dashboard/:id', updateDashboardEntry);
app.delete('/dashboard/:id', deleteDashboardEntry);
app.use(errorMiddleware);

describe('API Documentation', () => {
    test('GET /health', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'UP' });
    });

    test('GET /dashboard', async () => {
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(204);
    });

    test('POST /dashboard', async () => {
        const response = await request(app).post('/dashboard').send({ id: '1', value: 100 });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Entry created');
    });

    test('PUT /dashboard/:id', async () => {
        await request(app).post('/dashboard').send({ id: '2', value: 200 });
        const response = await request(app).put('/dashboard/2').send({ value: 300 });
        expect(response.status).toBe(204);
    });

    test('DELETE /dashboard/:id', async () => {
        await request(app).post('/dashboard').send({ id: '3', value: 300 });
        const response = await request(app).delete('/dashboard/3');
        expect(response.status).toBe(204);
    });
});