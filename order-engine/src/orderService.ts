import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { postgresStorage } from './postgresStorage';
import logger from './logger';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await postgresStorage.create(order);
        logger.info('Order created successfully', { order });
        return createdOrder;
    } catch (error) {
        logger.error('Failed to create order', { error: error.message });
        throw new ServiceError('Failed to create order due to database error: ' + error.message);
    }
};

const updateOrderService = async (id: string, updates: Partial<Order>) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ValidationError('Invalid update data: ' + parsedUpdates.error.errors.map(e => e.message).join(', '));
    }
    try {
        const updatedOrder = await postgresStorage.update(id, parsedUpdates.data);
        if (!updatedOrder) {
            throw new NotFoundError('Order not found.');
        }
        logger.info('Order updated successfully', { id, updates });
        return updatedOrder;
    } catch (error) {
        logger.error('Failed to update order', { error: error.message });
        throw new ServiceError('Failed to update order due to database error: ' + error.message);
    }
};

const deleteOrderService = async (id: string) => {
    try {
        await postgresStorage.delete(id);
        logger.info('Order deleted successfully', { id });
    } catch (error) {
        logger.error('Failed to delete order', { error: error.message });
        throw new NotFoundError('Order not found.');
    }
};

const getOrdersService = async () => {
    try {
        const orders = await postgresStorage.findAll();
        logger.info('Retrieved orders successfully');
        return orders;
    } catch (error) {
        logger.error('Failed to retrieve orders', { error: error.message });
        throw new ServiceError('Failed to retrieve orders: ' + error.message);
    }
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };