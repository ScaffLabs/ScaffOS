import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage';
import { postData } from './axiosClient';
import logger from './logger';
import { emitWithRetry } from './eventBus';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await storage.create(order);
        await postData(`${process.env.ORDER_SERVICE_URL}/orders`, createdOrder);
        await emitWithRetry({ type: 'ORDER_CREATED', payload: createdOrder });
        logger.info('Order created successfully', { order });
        return createdOrder;
    } catch (error) {
        logger.error('Failed to create order', { error: error.message });
        throw new ServiceError('Failed to create order due to storage error: ' + error.message);
    }
};

const updateOrderService = async (id: string, updates: Partial<Order>) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ValidationError('Invalid update data: ' + parsedUpdates.error.errors.map(e => e.message).join(', '));
    }
    try {
        const updatedOrder = await storage.update(id, parsedUpdates.data);
        if (!updatedOrder) {
            throw new NotFoundError('Order not found.');
        }
        await postData(`${process.env.ORDER_SERVICE_URL}/orders/${id}`, updatedOrder);
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: updatedOrder });
        logger.info('Order updated successfully', { id, updates });
        return updatedOrder;
    } catch (error) {
        logger.error('Failed to update order', { error: error.message });
        throw new ServiceError('Failed to update order due to storage error: ' + error.message);
    }
};

const deleteOrderService = async (id: string) => {
    try {
        await storage.delete(id);
        await postData(`${process.env.ORDER_SERVICE_URL}/orders/${id}`, {});
        await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
        logger.info('Order deleted successfully', { id });
    } catch (error) {
        logger.error('Failed to delete order', { error: error.message });
        throw new NotFoundError('Order not found.');
    }
};

export { createOrderService, updateOrderService, deleteOrderService };