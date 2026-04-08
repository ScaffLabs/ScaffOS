import { Order, OrderSchema } from './types';
import { emitWithRetry } from './eventBus';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage';
import logger from './logger';

export const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    return storage.create(order);
};

export const updateOrderService = async (id: string, updates: unknown) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ValidationError('Invalid order update data: ' + parsedUpdates.error.errors.map(e => e.message).join(', '));
    }
    const existingOrder = await storage.read(id);
    if (!existingOrder) {
        throw new NotFoundError('Order not found.');
    }
    return storage.update(id, updates);
};

export const deleteOrderService = async (id: string) => {
    const existingOrder = await storage.read(id);
    if (!existingOrder) {
        throw new NotFoundError('Order not found.');
    }
    return storage.delete(id);
};

export const getOrdersService = async ({ limit, offset }: { limit: number; offset: number; }) => {
    const orders = await storage.findAll();
    return orders.slice(offset, offset + limit);
};

export const getOrdersByStatusService = async (status: string) => {
    const orders = await storage.indexByStatus();
    return orders[status] || [];
};
