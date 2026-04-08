import request from 'supertest';
import express from 'express';
import userRoutes from '../userRoutes';
import { createUser } from '../storage';

const app = express();
app.use(express.json());
app.use(userRoutes);

describe('User Routes', () => {
    let apiKey;

    beforeAll(() => {
        apiKey = 'valid_api_key'; // Assume this key is valid.
    });

    it('should create a user', async () => {
        const res = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'testuser', email: 'test@example.com' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
    });

    it('should not create a user with existing email', async () => {
        await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'testuser2', email: 'test@example.com' });
        const res = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'testuser3', email: 'test@example.com' });
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
        const user = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'updateme', email: 'update@example.com' });
        const updatedRes = await request(app)
            .put(`/users/${user.body.id}`)
            .set('x-api-key', apiKey)
            .send({ username: 'updatedName' });
        expect(updatedRes.status).toBe(204);
    });

    it('should delete a user', async () => {
        const user = await request(app)
            .post('/users')
            .set('x-api-key', apiKey)
            .send({ username: 'deletethis', email: 'delete@example.com' });
        const deleteRes = await request(app)
            .delete(`/users/${user.body.id}`)
            .set('x-api-key', apiKey);
        expect(deleteRes.status).toBe(204);
    });
});
