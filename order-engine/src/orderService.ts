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
        // Notify other services about the order creation
        await postData(`${process.env.ORDER_SERVICE_URL}/orders`, createdOrder);
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
        // Notify other services about the order update
        await postData(`${process.env.ORDER_SERVICE_URL}/orders/${id}`, updatedOrder);
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
        // Notify other services about the order deletion
        await fetchData(`${process.env.ORDER_SERVICE_URL}/orders/${id}`, { method: 'DELETE' });
        logger.info('Order deleted successfully', { id });
    } catch (error) {
        logger.error('Failed to delete order', { error: error.message });
        throw new NotFoundError('Order not found.');
    }
};

const getOrdersService = async ({ limit, offset }: { limit: number; offset: number }) => {
    try {
        const orders = await storage.findAll();
        const paginatedOrders = orders.slice(offset, offset + limit);
        logger.info('Retrieved orders successfully');
        return paginatedOrders;
    } catch (error) {
        logger.error('Failed to retrieve orders', { error: error.message });
        throw new ServiceError('Failed to retrieve orders: ' + error.message);
    }
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };