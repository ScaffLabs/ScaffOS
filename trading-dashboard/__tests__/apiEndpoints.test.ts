import request from 'supertest';
import app from '../src/server';

describe('API Endpoints Integration Tests', () => {
    it('GET /api/positions returns a list of positions', async () => {
        const response = await request(app).get('/api/positions?limit=10&offset=0&sortBy=id&order=asc');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('POST /api/positions successfully creates a position', async () => {
        const newPosition = { id: '1', symbol: 'AAPL', quantity: 10 };
        const response = await request(app).post('/api/positions').send(newPosition);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Position created successfully');
    });

    it('PUT /api/positions/:id updates the position', async () => {
        const response = await request(app).put('/api/positions/1').send({ quantity: 15 });
        expect(response.status).toBe(204);
    });

    it('DELETE /api/positions/:id deletes the position', async () => {
        const response = await request(app).delete('/api/positions/1');
        expect(response.status).toBe(204);
    });

    it('GET /api/positions returns 404 for non-existing position', async () => {
        const response = await request(app).delete('/api/positions/99');
        expect(response.status).toBe(404);
    });
});
