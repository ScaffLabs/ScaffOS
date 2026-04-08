import { createOrderService, getOrdersService, updateOrderService, deleteOrderService } from '../src/orderService';
import { Order, OrderId } from '../src/types';
import { storage } from '../src/storage';
import { ValidationError, NotFoundError } from '../src/errors';

describe('Order Service', () => {
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
        await expect(createOrderService({ price: 100 })).rejects.toThrow(ValidationError);
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

    test('updateOrderService - should throw NotFoundError for non-existent order', async () => {
        await expect(updateOrderService('999', { price: 110 })).rejects.toThrow(NotFoundError);
    });

    test('deleteOrderService - should throw NotFoundError for non-existent order', async () => {
        await expect(deleteOrderService('999')).rejects.toThrow(NotFoundError);
    });

    test('createOrderService - should emit event after successful creation', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        const result = await createOrderService(newOrder);
        expect(result).toMatchObject(newOrder);
        // additional test to check if event was emitted could be added here
    });
});
