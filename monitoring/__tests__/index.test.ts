import request from 'supertest';
import express from 'express';
import { healthCheck } from '../healthCheck';
import { listDashboardEntries, createDashboardEntry, updateDashboardEntry, deleteDashboardEntry } from '../dashboard';
import errorMiddleware from '../errorMiddleware';
import InMemoryStore from '../dataStore';

const app = express();
const store = new InMemoryStore();
app.use(express.json());
app.get('/health', healthCheck);
app.get('/dashboard', listDashboardEntries);
app.post('/dashboard', createDashboardEntry);
app.put('/dashboard/:id', updateDashboardEntry);
app.delete('/dashboard/:id', deleteDashboardEntry);
app.use(errorMiddleware);

describe('API Tests', () => {
    beforeEach(() => {
        store.clear();
    });

    test('GET /health returns status UP', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'UP' });
    });

    test('GET /dashboard returns 204 when no entries', async () => {
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(204);
    });

    test('POST /dashboard creates an entry', async () => {
        const response = await request(app).post('/dashboard').send({ id: '1', data: { value: 100 }});
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Entry created');
    });

    test('POST /dashboard returns 400 for invalid input', async () => {
        const response = await request(app).post('/dashboard').send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data: Both id and value are required.');
    });

    test('PUT /dashboard/:id updates an entry', async () => {
        await request(app).post('/dashboard').send({ id: '2', data: { value: 200 }});
        const response = await request(app).put('/dashboard/2').send({ data: { value: 300 }});
        expect(response.status).toBe(204);
    });

    test('PUT /dashboard/:id returns 404 for non-existent entry', async () => {
        const response = await request(app).put('/dashboard/99').send({ data: { value: 400 }});
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });

    test('DELETE /dashboard/:id deletes an entry', async () => {
        await request(app).post('/dashboard').send({ id: '3', data: { value: 300 }});
        const response = await request(app).delete('/dashboard/3');
        expect(response.status).toBe(204);
    });

    test('DELETE /dashboard/:id returns 404 for non-existent entry', async () => {
        const response = await request(app).delete('/dashboard/99');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });
});