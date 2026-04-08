import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from '../src/orderService';
import { Order, OrderId } from '../src/types';
import { storage } from '../src/storage';
import { ValidationError, NotFoundError } from '../src/errors';

describe('Order Service Tests', () => {
    beforeEach(() => {
        storage.items = [];
    });

    test('createOrderService - should successfully create an order', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        const createdOrder = await createOrderService(newOrder);
        expect(createdOrder).toMatchObject(newOrder);
    });

    test('createOrderService - should throw error for invalid order data', async () => {
        const invalidOrder = { id: '1', type: 'limit', price: -100, quantity: 10, status: 'open' }; // Invalid price
        await expect(createOrderService(invalidOrder)).rejects.toThrow(ValidationError);
    });

    test('updateOrderService - should successfully update an existing order', async () => {
        const order: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await createOrderService(order);
        const updates = { price: 150 };
        const updatedOrder = await updateOrderService('1', updates);
        expect(updatedOrder?.price).toBe(150);
    });

    test('updateOrderService - should throw NotFoundError for non-existent order', async () => {
        await expect(updateOrderService('999', { price: 150 })).rejects.toThrow(NotFoundError);
    });

    test('deleteOrderService - should successfully delete an existing order', async () => {
        const order: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await createOrderService(order);
        await deleteOrderService('1');
        const deletedOrder = await storage.read('1');
        expect(deletedOrder).toBeNull();
    });

    test('deleteOrderService - should throw NotFoundError for non-existent order', async () => {
        await expect(deleteOrderService('999')).rejects.toThrow(NotFoundError);
    });

    test('getOrdersService - should return an empty array when no orders exist', async () => {
        const orders = await getOrdersService({ limit: 10, offset: 0 });
        expect(orders).toHaveLength(0);
    });

    test('getOrdersService - should return all existing orders', async () => {
        const order1: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        const order2: Order = { id: '2' as OrderId, type: 'market', price: 0, quantity: 5, status: 'open' };
        await createOrderService(order1);
        await createOrderService(order2);
        const orders = await getOrdersService({ limit: 10, offset: 0 });
        expect(orders).toHaveLength(2);
        expect(orders).toEqual(expect.arrayContaining([order1, order2]));
    });
});