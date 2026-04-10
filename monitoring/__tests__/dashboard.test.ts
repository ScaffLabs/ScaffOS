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

describe('Dashboard Endpoint', () => {
    beforeEach(() => {
        store.clear();
    });

    it('should return aggregated data', async () => {
        await request(app).post('/dashboard').send({ id: '1', data: { value: 100 }});
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: '1', data: { value: 100 }}]);
    });

    it('should handle empty data', async () => {
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(204);
        expect(response.body).toEqual([]);
    });

    it('should create a new entry', async () => {
        const response = await request(app).post('/dashboard').send({ id: '2', data: { value: 200 }});
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Entry created');
    });

    it('should return 400 for missing id', async () => {
        const response = await request(app).post('/dashboard').send({ data: { value: 300 }});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data: Both id and value are required.');
    });

    it('should return 404 for updating non-existent entry', async () => {
        const response = await request(app).put('/dashboard/99').send({ data: { value: 400 }});
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });

    it('should delete an entry', async () => {
        await request(app).post('/dashboard').send({ id: '3', data: { value: 300 }});
        const response = await request(app).delete('/dashboard/3');
        expect(response.status).toBe(204);

        const getResponse = await request(app).get('/dashboard');
        expect(getResponse.body).toEqual([]);
    });

    it('should handle deleting non-existent entry', async () => {
        const response = await request(app).delete('/dashboard/99');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });

    it('should return 400 for invalid entry data during creation', async () => {
        const response = await request(app).post('/dashboard').send({ id: '4' }); // Missing data
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data: Both id and value are required.');
    });

    it('should update entry correctly', async () => {
        await request(app).post('/dashboard').send({ id: '5', data: { value: 500 }});
        const response = await request(app).put('/dashboard/5').send({ data: { value: 600 }});
        expect(response.status).toBe(204);

        const getResponse = await request(app).get('/dashboard');
        expect(getResponse.body).toEqual([{ id: '5', data: { value: 600 }}]);
    });
});