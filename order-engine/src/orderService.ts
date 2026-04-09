import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { queryDatabase } from './db';
import logger from './logger';
import { emitOrderEvent } from './eventBus';
import { fetchData } from './axiosClient';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await queryDatabase('INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [order.id, order.type, order.price, order.quantity, order.status]);
        logger.info('Order created successfully', { order: createdOrder.rows[0] });
        emitOrderEvent({ type: 'ORDER_CREATED', payload: createdOrder.rows[0] });
        await notifyOtherServices(order);
        return createdOrder.rows[0];
    } catch (error) {
        logger.error('Database error during order creation', { error });
        throw new ServiceError('Failed to create order due to database error.');
    }
};

const notifyOtherServices = async (order: Order) => {
    const urls = [
        `${process.env.ANOTHER_SERVICE_URL}/orders`,
        `${process.env.ORDER_SERVICE_URL}/orders`
    ];
    const promises = urls.map(url => fetchData(url));
    try {
        await Promise.all(promises);
        logger.info('Successfully notified other services.');
    } catch (error) {
        logger.error('Failed to notify other services', { error });
    }
};

const updateOrderService = async (id: string, updates: Partial<Order>) => {
    try {
        const updatedOrder = await queryDatabase('UPDATE orders SET type = $1, price = $2, quantity = $3, status = $4 WHERE id = $5 RETURNING *', [updates.type, updates.price, updates.quantity, updates.status, id]);
        if (updatedOrder.rowCount === 0) {
            throw new NotFoundError('Order not found.');
        }
        emitOrderEvent({ type: 'ORDER_UPDATED', payload: updatedOrder.rows[0] });
        return updatedOrder.rows[0];
    } catch (error) {
        logger.error('Error updating order', { error });
        throw new ServiceError('Failed to update order due to database error.');
    }
};

const deleteOrderService = async (id: string) => {
    try {
        const deletedOrder = await queryDatabase('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        if (deletedOrder.rowCount === 0) {
            throw new NotFoundError('Order not found.');
        }
        emitOrderEvent({ type: 'ORDER_DELETED', payload: { id } });
    } catch (error) {
        logger.error('Error deleting order', { error });
        throw new ServiceError('Failed to delete order due to database error.');
    }
};

const getOrdersService = async ({ limit, offset }: { limit: number; offset: number }) => {
    const orders = await queryDatabase('SELECT * FROM orders LIMIT $1 OFFSET $2', [limit, offset]);
    return orders.rows;
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };