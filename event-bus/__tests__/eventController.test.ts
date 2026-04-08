import request from 'supertest';
import { app } from '../index';
import { createEventSchema } from '../types';

describe('Event Controller', () => {
    describe('POST /events', () => {
        it('should create an event with valid data', async () => {
            const response = await request(app)
                .post('/events')
                .send({ title: 'Test Event', description: 'This is a test event', type: 'userCreated' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id');
            expect(createEventSchema.safeParse(response.body).success).toBe(true);
        });

        it('should return 400 for invalid data', async () => {
            const response = await request(app)
                .post('/events')
                .send({ title: '', description: 'This is a test event', type: 'userCreated' });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('Title is required');
        });
    });

    describe('GET /events', () => {
        it('should return a list of events', async () => {
            const response = await request(app)
                .get('/events');
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /events/:id', () => {
        it('should return a specific event', async () => {
            const newEvent = await request(app)
                .post('/events')
                .send({ title: 'Event to Get', description: 'This is the event to be fetched', type: 'userCreated' });

            const response = await request(app)
                .get(`/events/${newEvent.body.id}`);
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(newEvent.body.id);
        });

        it('should return 404 for non-existent event', async () => {
            const response = await request(app)
                .get('/events/non-existent-id');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Event not found');
        });
    });

    describe('PUT /events/:id', () => {
        it('should update an existing event', async () => {
            const newEvent = await request(app)
                .post('/events')
                .send({ title: 'Event to Update', description: 'This event will be updated', type: 'userCreated' });

            const response = await request(app)
                .put(`/events/${newEvent.body.id}`)
                .send({ title: 'Updated Event' });
            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Event');
        });

        it('should return 404 for non-existent event update', async () => {
            const response = await request(app)
                .put('/events/non-existent-id')
                .send({ title: 'Trying to Update' });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Event not found');
        });
    });

    describe('DELETE /events/:id', () => {
        it('should delete an event', async () => {
            const newEvent = await request(app)
                .post('/events')
                .send({ title: 'Event to Delete', description: 'This event will be deleted', type: 'userCreated' });

            const response = await request(app)
                .delete(`/events/${newEvent.body.id}`);
            expect(response.status).toBe(204);
        });

        it('should return 404 when trying to delete a non-existent event', async () => {
            const response = await request(app)
                .delete('/events/non-existent-id');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Event not found');
        });
    });
});
