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
    const createdOrder = await storage.create(order);
    await emitWithRetry({ type: 'ORDER_CREATED', payload: createdOrder });
    return createdOrder;
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
    const updatedOrder = await storage.update(id, updates);
    await emitWithRetry({ type: 'ORDER_UPDATED', payload: updatedOrder });
    return updatedOrder;
};

export const deleteOrderService = async (id: string) => {
    const existingOrder = await storage.read(id);
    if (!existingOrder) {
        throw new NotFoundError('Order not found.');
    }
    await storage.delete(id);
    await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
};

export const getOrdersService = async ({ limit, offset, status, sortBy, order }: { limit: number; offset: number; status?: string; sortBy?: string; order?: string; }) => {
    let orders = await storage.findAll();
    if (status) {
        orders = orders.filter(order => order.status === status);
    }
    if (sortBy) {
        orders.sort((a, b) => {
            if (order === 'asc') {
                return a[sortBy] > b[sortBy] ? 1 : -1;
            } else {
                return a[sortBy] < b[sortBy] ? 1 : -1;
            }
        });
    }
    return orders.slice(offset, offset + limit);
};

export const getOrdersByStatusService = async (status: string) => {
    const orders = await storage.indexByStatus();
    return orders[status] || [];
};