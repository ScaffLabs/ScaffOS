import { fetchData, postData } from './axiosClient';
import { Order, OrderEvent } from './types';
import { emitWithRetry } from './eventBus';
import { storage } from './storage';
import { ValidationError, NotFoundError } from './errors';

export const createOrderService = async (order: Order) => {
    if (!order.id || !order.type || order.price <= 0 || order.quantity <= 0 || !['open', 'filled', 'cancelled'].includes(order.status)) {
        throw new ValidationError('Invalid order fields');
    }
    const createdOrder = await storage.create(order);
    await emitWithRetry({ type: 'ORDER_CREATED', payload: createdOrder });
    return createdOrder;
};

export const getOrdersService = async () => {
    const orders = await storage.findAll();
    if (!orders.length) {
        throw new NotFoundError('No orders found.');
    }
    return orders;
};

export const updateOrderService = async (id: string, updates: Partial<Order>) => {
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