import { Order, OrderSchema } from './types';
import { emitWithRetry } from './eventBus';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage';
import logger from './logger';
import axios from 'axios';

const httpClient = axios.create({
    baseURL: process.env.ORDER_SERVICE_URL,
    timeout: 5000,
});

const fetchDependenciesHealth = async () => {
    try {
        const response = await httpClient.get('/health');
        return response.status === 200;
    } catch (error) {
        logger.error('Dependency health check failed:', error);
        return false;
    }
};

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

export const getOrdersService = async ({ limit, offset, status }: { limit: number; offset: number; status?: string; }) => {
    await fetchDependenciesHealth();
    let orders = await storage.findAll();
    if (status) {
        orders = orders.filter(order => order.status === status);
    }
    return orders.slice(offset, offset + limit);
};
