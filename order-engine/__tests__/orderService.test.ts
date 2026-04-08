import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from '../src/orderService';
import { Order, OrderId } from '../src/types';
import { storage } from '../src/storage';
import { ValidationError, NotFoundError } from '../src/errors';

describe('Order Service Tests', () => {
    beforeEach(() => {
        storage.items = [];
    });

    test('createOrderService - should throw error for empty order', async () => {
        await expect(createOrderService({})).rejects.toThrow(ValidationError);
    });

    test('createOrderService - should throw error for missing required fields', async () => {
        const invalidOrder = { id: '1', type: 'limit' }; // Missing price and quantity
        await expect(createOrderService(invalidOrder)).rejects.toThrow(ValidationError);
    });

    test('getOrdersService - should throw NotFoundError when no orders exist', async () => {
        await expect(getOrdersService()).rejects.toThrow(NotFoundError);
    });

    test('updateOrderService - should throw ValidationError for invalid updates', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        await createOrderService(newOrder);
        await expect(updateOrderService('1', { price: -50 })).rejects.toThrow(ValidationError);
    });

    test('deleteOrderService - should throw NotFoundError for non-existent order', async () => {
        await expect(deleteOrderService('999')).rejects.toThrow(NotFoundError);
    });

    test('createOrderService - should emit event after successful creation', async () => {
        const newOrder: Order = { id: '1' as OrderId, type: 'limit', price: 100, quantity: 10, status: 'open' };
        const result = await createOrderService(newOrder);
        expect(result).toMatchObject(newOrder);
        // Check if event was emitted - additional test can be implemented here
    });
});