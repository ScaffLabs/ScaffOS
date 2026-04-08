import { Order, OrderSchema } from './types';
import { emitWithRetry } from './eventBus';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage';
import logger from './logger';
import axios from 'axios';

export const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await storage.create(order);
        await emitWithRetry({ type: 'ORDER_CREATED', payload: createdOrder });
        logger.info('Order created successfully', { order: createdOrder });
        return createdOrder;
    } catch (error) {
        logger.error('Error creating order:', error);
        throw new ServiceError('Could not create order. Please try again later.');
    }
};

export const fetchExternalService = async (url: string) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        logger.error('Error fetching external service:', error);
        throw new ServiceError('Failed to fetch external service.');
    }
};

export const updateOrderWithExternalService = async (id: string, updates: unknown) => {
    const order = await updateOrderService(id, updates);
    await fetchExternalService(`${process.env.ORDER_SERVICE_URL}/orders/${id}`);
    return order;
};

export const updateOrderService = async (id: string, updates: unknown) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ValidationError('Invalid order update data: ' + parsedUpdates.error.errors.map(e => e.message).join(', '));
    }
    const orderToUpdate = await storage.read(id);
    if (!orderToUpdate) {
        throw new NotFoundError('Order not found.');
    }
    try {
        const updatedOrder = await storage.update(id, parsedUpdates.data);
        if (!updatedOrder) {
            throw new ServiceError('Failed to update order.');
        }
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: updatedOrder });
        logger.info('Order updated successfully', { order: updatedOrder });
        return updatedOrder;
    } catch (error) {
        logger.error('Error updating order:', error);
        throw new ServiceError('Could not update order. Please try again later.');
    }
};