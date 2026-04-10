import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        return await storage.create(order);
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
        return updatedOrder;
    } catch (error) {
        throw new ServiceError('Failed to update order due to database error: ' + error.message);
    }
};

const deleteOrderService = async (id: string) => {
    try {
        await storage.delete(id);
    } catch (error) {
        throw new NotFoundError('Order not found.');
    }
};

const getOrdersService = async () => {
    try {
        const orders = await storage.findAll();
        if (!orders.length) {
            throw new NotFoundError('No orders found.');
        }
        return orders;
    } catch (error) {
        throw new ServiceError('Failed to retrieve orders: ' + error.message);
    }
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };