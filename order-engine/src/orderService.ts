// OrderService.ts
import { Order, OrderSchema } from './types';
import { emitWithRetry } from './eventBus';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { queryDatabase } from './db';
import logger from './logger';
import { fetchData } from './axiosClient';

const ANOTHER_SERVICE_URL = process.env.ANOTHER_SERVICE_URL;

export const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await queryDatabase('INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [order.id, order.type, order.price, order.quantity, order.status]);
        await emitWithRetry({ type: 'ORDER_CREATED', payload: createdOrder.rows[0] });
        logger.info('Order created successfully', { order: createdOrder.rows[0] });
        return createdOrder.rows[0];
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
    const orderToUpdate = await queryDatabase('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderToUpdate.rowCount === 0) {
        throw new NotFoundError('Order not found.');
    }
    try {
        const updatedOrder = await queryDatabase('UPDATE orders SET type = COALESCE($1, type), price = COALESCE($2, price), quantity = COALESCE($3, quantity), status = COALESCE($4, status) WHERE id = $5 RETURNING *', [updates.type, updates.price, updates.quantity, updates.status, id]);
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: updatedOrder.rows[0] });
        logger.info('Order updated successfully', { order: updatedOrder.rows[0] });
        return updatedOrder.rows[0];
    } catch (error) {
        logger.error('Error updating order:', error);
        throw new ServiceError('Could not update order. Please try again later.');
    }
};

export const deleteOrderService = async (id: string) => {
    const orderToDelete = await queryDatabase('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderToDelete.rowCount === 0) {
        throw new NotFoundError('Order not found.');
    }
    try {
        await queryDatabase('DELETE FROM orders WHERE id = $1', [id]);
        await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
        logger.info('Order deleted successfully', { id });
    } catch (error) {
        logger.error('Error deleting order:', error);
        throw new ServiceError('Could not delete order. Please try again later.');
    }
};

export const getOrdersService = async ({ limit, offset, status }) => {
    let query = 'SELECT * FROM orders';
    const params: any[] = [];

    if (status) {
        query += ' WHERE status = $1';
        params.push(status);
    }

    query += ' LIMIT $2 OFFSET $3';
    params.push(limit, offset);

    try {
        const orders = await queryDatabase(query, params);
        logger.info('Orders retrieved successfully', { count: orders.rowCount });
        return orders.rows;
    } catch (error) {
        logger.error('Error retrieving orders:', error);
        throw new ServiceError('Could not retrieve orders. Please try again later.');
    }
};