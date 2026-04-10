import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes';
import { createUser } from '../storage';
import { validateApiKey } from '../apiKey';

const app = express();
app.use(express.json());
app.use(userRoutes);

describe('User Routes Integration Tests', () => {
    let apiKey;
    let createdUser;

    beforeAll(async () => {
        apiKey = 'valid_api_key'; // Assume this key is valid.
        createdUser = await createUser('testuser', 'test@example.com');
    });

    it('should create a user', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('x-api-key', apiKey)
            .send({ username: 'newuser', email: 'new@example.com' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should return 404 for non-existent user', async () => {
        const res = await request(app)
            .get('/api/users/nonexistentId')
            .set('x-api-key', apiKey);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'User not found' });
    });

    it('should return 400 for invalid user creation data', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('x-api-key', apiKey)
            .send({ username: '', email: 'invalidEmail' });
        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 401 for invalid API key', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('x-api-key', 'invalid_key')
            .send({ username: 'user', email: 'user@example.com' });
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Invalid API key' });
    });
});