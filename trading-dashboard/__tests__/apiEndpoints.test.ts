import request from 'supertest';
import app from '../src/server';
import { InMemoryStore } from '../src/storage/InMemoryStore';
import { Position } from '../src/types';

describe('API Endpoints Integration Tests', () => {
    let store: InMemoryStore<Position>;

    beforeEach(() => {
        store = new InMemoryStore<Position>();
        store.create({ id: '1', symbol: 'AAPL', quantity: 10 });
    });

    it('GET /api/positions returns a list of positions', async () => {
        const response = await request(app).get('/api/positions?limit=10&offset=0&sortBy=id&order=asc');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0]).toEqual({ id: '1', symbol: 'AAPL', quantity: 10 });
    });

    it('POST /api/positions successfully creates a position', async () => {
        const newPosition = { id: '2', symbol: 'GOOGL', quantity: 5 };
        const response = await request(app).post('/api/positions').send(newPosition);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Position created successfully');
        expect(response.body.position).toEqual(newPosition);
    });

    it('PUT /api/positions/:id updates the position', async () => {
        const response = await request(app).put('/api/positions/1').send({ quantity: 15 });
        expect(response.status).toBe(204);
        const updatedPositionResponse = await request(app).get('/api/positions');
        expect(updatedPositionResponse.body[0].quantity).toBe(15);
    });

    it('DELETE /api/positions/:id deletes the position', async () => {
        const response = await request(app).delete('/api/positions/1');
        expect(response.status).toBe(204);
        const deletedPositionResponse = await request(app).get('/api/positions');
        expect(deletedPositionResponse.body.length).toBe(0);
    });

    it('GET /api/positions returns 404 for non-existing position', async () => {
        const response = await request(app).delete('/api/positions/99');
        expect(response.status).toBe(404);
    });
});