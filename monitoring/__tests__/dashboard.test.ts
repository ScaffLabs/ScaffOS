import request from 'supertest';
import express from 'express';
import { listDashboardEntries, createDashboardEntry, updateDashboardEntry, deleteDashboardEntry } from '../dashboard';
import errorMiddleware from '../errorMiddleware';
import { ValidationError, NotFoundError } from '../errorClasses';
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
        store.storage.clear();
    });

    it('should return aggregated data', async () => {
        await request(app).post('/dashboard').send({ id: '1', value: 100 });
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: '1', data: { value: 100 } }]);
    });

    it('should handle no data available', async () => {
        const response = await request(app).get('/dashboard');
        expect(response.status).toBe(204);
        expect(response.body).toEqual([]);
    });

    it('should create a new entry', async () => {
        const response = await request(app).post('/dashboard').send({ id: '2', value: 200 });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Entry created');
    });

    it('should return 400 for invalid entry', async () => {
        const response = await request(app).post('/dashboard').send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data. Both id and value are required.');
    });

    it('should update an existing entry', async () => {
        await request(app).post('/dashboard').send({ id: '3', value: 300 });
        const response = await request(app).put('/dashboard/3').send({ value: 400 });
        expect(response.status).toBe(204);

        const getResponse = await request(app).get('/dashboard');
        expect(getResponse.body).toEqual([{ id: '3', data: { value: 400 } }]);
    });

    it('should return 404 for non-existent entry', async () => {
        const response = await request(app).put('/dashboard/99').send({ value: 500 });
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });

    it('should delete an existing entry', async () => {
        await request(app).post('/dashboard').send({ id: '4', value: 400 });
        const response = await request(app).delete('/dashboard/4');
        expect(response.status).toBe(204);

        const getResponse = await request(app).get('/dashboard');
        expect(getResponse.body).toEqual([]);
    });

    it('should handle deletion of non-existent entry', async () => {
        const response = await request(app).delete('/dashboard/99');
        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Entry not found.');
    });

    it('should handle invalid update data', async () => {
        await request(app).post('/dashboard').send({ id: '5', value: 500 });
        const response = await request(app).put('/dashboard/5').send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data.');
    });

    it('should handle edge case for empty id', async () => {
        const response = await request(app).post('/dashboard').send({ id: '', value: 100 });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data. Both id and value are required.');
    });

    it('should handle edge case for negative value', async () => {
        const response = await request(app).post('/dashboard').send({ id: '6', value: -50 });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data. Both id and value are required.');
    });

    it('should handle edge case for invalid id format', async () => {
        const response = await request(app).post('/dashboard').send({ id: 'invalid-id', value: 200 });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid input data.');
    });
});