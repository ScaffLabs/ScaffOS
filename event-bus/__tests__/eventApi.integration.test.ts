import request from 'supertest';
import { app } from '../index';
import { createEventSchema } from '../types';

describe('Event API Integration Tests', () => {
    beforeEach(async () => {
        await request(app).delete('/events'); // Reset the events
    });

    describe('POST /events', () => {
        it('should create an event with valid data', async () => {
            const response = await request(app)
                .post('/events')
                .send({ title: 'New Event', description: 'This is a new event', type: 'userCreated' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(createEventSchema.safeParse(response.body).success).toBe(true);
        });

        it('should return 400 for missing title', async () => {
            const response = await request(app)
                .post('/events')
                .send({ description: 'This is a new event', type: 'userCreated' });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Title is required');
        });
    });

    describe('GET /events', () => {
        it('should return a list of events', async () => {
            await request(app)
                .post('/events')
                .send({ title: 'Event 1', description: 'Description 1', type: 'userCreated' });
            const response = await request(app).get('/events');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
        });

        it('should return 404 for no events found', async () => {
            const response = await request(app).get('/events?limit=0');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('No events found');
        });
    });
});
