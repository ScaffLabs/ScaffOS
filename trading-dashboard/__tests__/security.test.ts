import request from 'supertest';
import app from '../src/server';

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

    it('should return 429 when exceeding rate limit', async () => {
        const promises = Array.from({ length: 110 }, () => 
            request(app).get('/api/positions'));
        const responses = await Promise.all(promises);
        const rateLimitExceeded = responses.filter(res => res.status === 429);
        expect(rateLimitExceeded.length).toBeGreaterThan(0);
    });
});
