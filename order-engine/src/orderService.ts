import { Order } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { storage } from './storage'; // Change to postgresStorage when using PostgreSQL

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await storage.create(order);
        emitOrderEvent({ type: 'ORDER_CREATED', payload: createdOrder });
        return createdOrder;
    } catch (error) {
        throw new ServiceError('Failed to create order due to database error.');
    }
};

const updateOrderService = async (id: string, updates: Partial<Order>) => {
    const updatedOrder = await storage.update(id, updates);
    if (!updatedOrder) {
        throw new NotFoundError('Order not found.');
    }
    emitOrderEvent({ type: 'ORDER_UPDATED', payload: updatedOrder });
    return updatedOrder;
};

const deleteOrderService = async (id: string) => {
    await storage.delete(id);
};

const getOrdersService = async () => {
    return await storage.findAll();
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };