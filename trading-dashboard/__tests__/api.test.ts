import request from 'supertest';
import app from '../src/server';

describe('API Endpoints', () => {
    it('GET /api/positions', async () => {
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(200);
    });

    it('PUT /api/positions/:id with valid data', async () => {
        const response = await request(app)
            .put('/api/positions/1')
            .send({ quantity: 10 });
        expect(response.status).toBe(204);
    });

    it('PUT /api/positions/:id with invalid data', async () => {
        const response = await request(app)
            .put('/api/positions/1')
            .send({ quantity: -10 });
        expect(response.status).toBe(400);
    });

    it('DELETE /api/positions/:id', async () => {
        const response = await request(app).delete('/api/positions/1');
        expect(response.status).toBe(204);
    });
});
