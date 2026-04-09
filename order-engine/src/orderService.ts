import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { database } from './database';
import logger from './logger';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    const createdOrder = await database.create(order);
    return createdOrder;
};

const updateOrderService = async (id: string, updates: unknown) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ValidationError('Invalid order update data: ' + parsedUpdates.error.errors.map(e => e.message).join(', '));
    }
    const existingOrder = await database.read(id);
    if (!existingOrder) {
        throw new NotFoundError('Order not found.');
    }
    const updatedOrder = await database.update(id, updates);
    return updatedOrder;
};

const deleteOrderService = async (id: string) => {
    const existingOrder = await database.read(id);
    if (!existingOrder) {
        throw new NotFoundError('Order not found.');
    }
    await database.delete(id);
};

const getOrdersService = async () => {
    return await database.findAll();
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };