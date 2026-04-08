import request from 'supertest';
import { createServer } from '../src/index';
import { Order } from '../src/types';
import { storage } from '../src/storage';

describe('Order Controller', () => {
    let app: Express.Application;

    beforeAll(async () => {
        app = await createServer();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        storage.items = [];
    });

    test('POST /orders - reject order with invalid fields', async () => {
        const invalidOrder = { id: '1', type: 'invalid', price: -100, quantity: 10, status: 'open' }; // Invalid type and price

        const response = await request(app)
            .post('/orders')
            .send(invalidOrder)
            .expect(400);

        expect(response.body.errors).toBeDefined();
    });

    test('GET /orders - return 404 when there are no orders', async () => {
        const response = await request(app)
            .get('/orders')
            .expect(404);

        expect(response.body.message).toBe('No orders found.');
    });

    test('PUT /orders/:id - return 404 when updating non-existent order', async () => {
        const updatedOrder = { price: 110, quantity: 5 };
        const response = await request(app)
            .put('/orders/999')
            .send(updatedOrder)
            .expect(404);

        expect(response.body.message).toBe('Order not found.');
    });

    test('DELETE /orders/:id - return 404 when deleting non-existent order', async () => {
        await request(app)
            .delete('/orders/999')
            .expect(404);
    });
});