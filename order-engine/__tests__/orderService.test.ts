import request from 'supertest';
import { createServer } from '../src/index';
import { Order } from '../src/types';
import { storage } from '../src/storage';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from '../src/orderService';

describe('Order Service', () => {
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

    test('createOrderService - should create a valid order', async () => {
        const newOrder: Order = {
            id: '1' as OrderId,
            type: 'limit',
            price: 100,
            quantity: 10,
            status: 'open',
        };

        const result = await createOrderService(newOrder);
        expect(result).toMatchObject(newOrder);
    });

    test('createOrderService - should throw error for invalid order', async () => {
        await expect(createOrderService({ price: 100 })).rejects.toThrow('Service Unavailable');
    });

    test('getOrdersService - should retrieve all orders', async () => {
        const order1: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        const order2: Order = { id: '2' as OrderId, type: 'market', price: 0, quantity: 5, status: 'open' };
        await storage.create(order1);
        await storage.create(order2);

        const orders = await getOrdersService();
        expect(orders).toHaveLength(2);
        expect(orders).toEqual(expect.arrayContaining([order1, order2]));
    });

    test('updateOrderService - should update an existing order', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await storage.create(newOrder);

        const updatedOrder = { price: 110, quantity: 5 };
        const result = await updateOrderService('1', updatedOrder);
        expect(result).toMatchObject({ ...newOrder, ...updatedOrder });
    });

    test('deleteOrderService - should delete an existing order', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await storage.create(newOrder);

        await deleteOrderService('1');
        const orders = await storage.findAll();
        expect(orders).toHaveLength(0);
    });
});