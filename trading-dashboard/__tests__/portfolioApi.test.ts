import request from 'supertest';
import app from '../src/server';
import { InMemoryStore } from '../src/storage/InMemoryStore';
import { Position } from '../src/types';
import { createPosition, fetchPositions, updatePosition, deletePosition } from '../src/api/portfolioApi';

describe('Portfolio API Endpoints', () => {
    let store: InMemoryStore<Position>;

    beforeEach(() => {
        store = new InMemoryStore<Position>();
        store.create({ id: '1', symbol: 'AAPL', quantity: 100 });
    });

    it('GET /api/positions should return all positions', async () => {
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([{ id: '1', symbol: 'AAPL', quantity: 100 }]);
    });

    it('POST /api/positions should create a position with valid data', async () => {
        const response = await request(app)
            .post('/api/positions')
            .send({ id: '2', symbol: 'GOOGL', quantity: 50 });
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Position created successfully', position: { id: '2', symbol: 'GOOGL', quantity: 50 } });
    });

    it('POST /api/positions should return 400 for invalid data', async () => {
        const response = await request(app)
            .post('/api/positions')
            .send({ id: '3', symbol: 'MSFT' }); // Missing quantity
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid position data');
    });

    it('PUT /api/positions/:id should update an existing position', async () => {
        const response = await request(app)
            .put('/api/positions/1')
            .send({ quantity: 150 });
        expect(response.status).toBe(204);
        const updatedResponse = await request(app).get('/api/positions');
        expect(updatedResponse.body[0].quantity).toBe(150);
    });

    it('DELETE /api/positions/:id should delete a position', async () => {
        const response = await request(app).delete('/api/positions/1');
        expect(response.status).toBe(204);
        const fetchResponse = await request(app).get('/api/positions');
        expect(fetchResponse.body.length).toBe(0);
    });

    it('GET /api/positions with invalid pagination should return 400', async () => {
        const response = await request(app).get('/api/positions?limit=invalid');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid pagination parameters' });
    });
});