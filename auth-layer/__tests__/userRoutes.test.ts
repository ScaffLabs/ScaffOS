import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes';
import { createUser } from '../storage';
import { validateApiKey } from '../apiKey';

const app = express();
app.use(express.json());
app.use(userRoutes);

describe('User Routes', () => {
    let apiKey;
    let createdUser;

    beforeAll(async () => {
        apiKey = 'valid_api_key'; // Assume this key is valid.
        // Create a test user
        createdUser = await createUser('testuser', 'test@example.com');
    });

    it('should create a user', async () => {
        const res = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'newuser', email: 'new@example.com' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should not create a user with existing email', async () => {
        const res = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'duplicateuser', email: 'test@example.com' });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ error: 'Email already in use' });
    });

    it('should get all users', async () => {
        const res = await request(app)
            .get('/users')
            .set('x-api-key', apiKey);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should update a user', async () => {
        const updatedRes = await request(app)
            .put(`/users/${createdUser.id}`)
            .set('x-api-key', apiKey)
            .send({ username: 'updatedName' });
        expect(updatedRes.status).toBe(204);
    });

    it('should delete a user', async () => {
        const deleteRes = await request(app)
            .delete(`/users/${createdUser.id}`)
            .set('x-api-key', apiKey);
        expect(deleteRes.status).toBe(204);
    });

    it('should return 404 for non-existent user', async () => {
        const res = await request(app)
            .get('/users/nonexistentId')
            .set('x-api-key', apiKey);
        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'User not found' });
    });

    it('should return 400 for invalid user data', async () => {
        const res = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: '', email: 'invalidEmail' });
        expect(res.status).toBe(400);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });
});