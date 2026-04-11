import request from 'supertest';
import express from 'express';
import { listDashboardEntries, createDashboardEntry, updateDashboardEntry, deleteDashboardEntry } from '../dashboard';
import errorMiddleware from '../errorMiddleware';
import InMemoryStore from '../dataStore';

const app = express();
const store = new InMemoryStore();
app.use(express.json());
app.get('/dashboard', listDashboardEntries);
app.post('/dashboard', createDashboardEntry);
app.put('/dashboard/:id', updateDashboardEntry);
app.delete('/dashboard/:id', deleteDashboardEntry);
app.use(errorMiddleware);

describe('Dashboard Endpoint Tests', () => {
    beforeEach(() => {
        store.clear();
    });

    it('should return 204 when no entries exist', async () => {
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(204);
    });

    it('should create a new dashboard entry', async () => {
        const response = await request(app).post('/dashboard').send({ id: '1', data: { value: 100 } });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Entry created');
    });

    it('should not create duplicate entries', async () => {
        await request(app).post('/dashboard').send({ id: '2', data: { value: 200 }});
        const response = await request(app).post('/dashboard').send({ id: '2', data: { value: 300 }});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data: Both id and data are required.');
    });

    it('should update an existing entry', async () => {
        await request(app).post('/dashboard').send({ id: '3', data: { value: 300 }});
        const response = await request(app).put('/dashboard/3').send({ data: { value: 400 }});
        expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent entry update', async () => {
        const response = await request(app).put('/dashboard/99').send({ data: { value: 500 }});
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });

    it('should delete an entry', async () => {
        await request(app).post('/dashboard').send({ id: '4', data: { value: 400 }});
        const response = await request(app).delete('/dashboard/4');
        expect(response.status).toBe(204);
    });

    it('should return 404 for deleting a non-existent entry', async () => {
        const response = await request(app).delete('/dashboard/99');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });
});