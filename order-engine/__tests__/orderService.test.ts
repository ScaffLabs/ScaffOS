import request from 'supertest';
import { createServer } from '../src/index';
import { Order } from '../src/types';
import { storage } from '../src/storage';

describe('Order Service', () => {
    let app: Express.Application;

    beforeAll(async () => {
        app = await createServer();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        // Clear the storage before each test
        storage.items = [];
    });

    test('POST /orders - create order with valid data', async () => {
        const newOrder: Order = {
            id: '1' as OrderId,
            type: 'limit',
            price: 100,
            quantity: 10,
            status: 'open',
        };

        const response = await request(app)
            .post('/orders')
            .send(newOrder)
            .expect(201);

        expect(response.body).toEqual(newOrder);
    });

    test('POST /orders - reject order with invalid data', async () => {
        const invalidOrder = { price: 100 }; // Missing required fields

        const response = await request(app)
            .post('/orders')
            .send(invalidOrder)
            .expect(400);

        expect(response.body.errors).toBeDefined();
    });

    test('GET /orders - retrieve all orders', async () => {
        const order1: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        const order2: Order = { id: '2' as OrderId, type: 'market', price: 0, quantity: 5, status: 'open' };
        await storage.create(order1);
        await storage.create(order2);

        const response = await request(app)
            .get('/orders')
            .expect(200);

        expect(response.body).toHaveLength(2);
        expect(response.body).toEqual(expect.arrayContaining([order1, order2]));
    });

    test('PUT /orders/:id - update existing order', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await storage.create(newOrder);

        const updatedOrder = { type: 'limit', price: 110, quantity: 5, status: 'open' };
        const response = await request(app)
            .put('/orders/1')
            .send(updatedOrder)
            .expect(200);

        expect(response.body).toMatchObject(updatedOrder);
    });

    test('DELETE /orders/:id - delete existing order', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await storage.create(newOrder);

        await request(app)
            .delete('/orders/1')
            .expect(204);

        const orders = await storage.findAll();
        expect(orders).toHaveLength(0);
    });

    test('GET /orders/:id - return 404 for non-existent order', async () => {
        await request(app)
            .get('/orders/999')
            .expect(404);
    });

    test('POST /orders - reject order with empty body', async () => {
        const response = await request(app)
            .post('/orders')
            .send({})
            .expect(400);

        expect(response.body.errors).toBeDefined();
    });

    test('PUT /orders/:id - update non-existent order', async () => {
        const updatedOrder = { price: 110, quantity: 5 };
        const response = await request(app)
            .put('/orders/999')
            .send(updatedOrder)
            .expect(404);

        expect(response.body.message).toBe('Order not found.');
    });
});
