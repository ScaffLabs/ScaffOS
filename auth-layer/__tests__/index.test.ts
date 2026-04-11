import request from 'supertest';
import express from 'express';
import healthRouter from '../health';
import userRoutes from '../userRoutes';
import { createUser } from '../storage';
import { validateApiKey } from '../apiKey';

const app = express();
app.use(express.json());
app.use(healthRouter);
app.use(userRoutes);

describe('Integration Tests', () => {
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

    it('should return 409 for duplicate email', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('x-api-key', apiKey)
            .send({ username: 'duplicateuser', email: 'test@example.com' });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: 'Email already in use' });
    });

    it('should return 400 for invalid user creation data', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('x-api-key', apiKey)
            .send({ username: '', email: 'invalidEmail' });
        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return healthy status from health check endpoint', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'healthy' });
    });
});
