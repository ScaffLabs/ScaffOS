import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage';
import { fetchData, postData } from './axiosClient';
import logger from './logger';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await storage.create(order);
        // Emit event
        await postData(`${process.env.ORDER_SERVICE_URL}/events`, { type: 'ORDER_CREATED', payload: createdOrder });
        return createdOrder;
    } catch (error) {
        throw new ServiceError('Failed to create order due to database error: ' + error.message);
    }
};

const updateOrderService = async (id: string, updates: Partial<Order>) => {
    try {
        const updatedOrder = await storage.update(id, updates);
        if (!updatedOrder) {
            throw new NotFoundError('Order not found.');
        }
        // Emit event
        await postData(`${process.env.ORDER_SERVICE_URL}/events`, { type: 'ORDER_UPDATED', payload: updatedOrder });
        return updatedOrder;
    } catch (error) {
        throw new ServiceError('Failed to update order due to database error: ' + error.message);
    }
};

const deleteOrderService = async (id: string) => {
    try {
        await storage.delete(id);
        // Emit event
        await postData(`${process.env.ORDER_SERVICE_URL}/events`, { type: 'ORDER_DELETED', payload: { id } });
    } catch (error) {
        throw new NotFoundError('Order not found.');
    }
};

const getOrdersService = async () => {
    try {
        return await storage.findAll();
    } catch (error) {
        throw new ServiceError('Failed to retrieve orders: ' + error.message);
    }
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };