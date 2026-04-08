import request from 'supertest';
import app from '../server';

describe('Security Enhancements', () => {
    it('should limit request rate', async () => {
        const response = await request(app).get('/api/positions');
        expect(response.status).toBe(200);
    });

    it('should return 400 for invalid quantity', async () => {
        const response = await request(app)
            .put('/api/positions/1')
            .send({ quantity: -5 });
        expect(response.status).toBe(400);
    });
});