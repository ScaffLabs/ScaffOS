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
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: updatedOrder });
        logger.info('Order updated successfully', { order: updatedOrder });
        return updatedOrder;
    } catch (error) {
        logger.error('Error updating order:', error);
        throw new ServiceError('Could not update order. Please try again later.');
    }
};

export const deleteOrderService = async (id: string) => {
    const orderToDelete = await storage.read(id);
    if (!orderToDelete) {
        throw new NotFoundError('Order not found.');
    }
    try {
        await storage.delete(id);
        await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
        logger.info('Order deleted successfully', { id });
    } catch (error) {
        logger.error('Error deleting order:', error);
        throw new ServiceError('Could not delete order. Please try again later.');
    }
};

export const getOrdersService = async () => {
    try {
        const orders = await storage.findAll();
        logger.info('Orders retrieved successfully', { count: orders.length });
        return orders;
    } catch (error) {
        logger.error('Error retrieving orders:', error);
        throw new ServiceError('Could not retrieve orders. Please try again later.');
    }
};