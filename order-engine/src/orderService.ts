import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { queryDatabase } from './db';
import logger from './logger';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    try {
        const createdOrder = await queryDatabase('INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [order.id, order.type, order.price, order.quantity, order.status]);
        logger.info('Order created successfully', { order: createdOrder.rows[0] });
        return createdOrder.rows[0];
    } catch (error) {
        logger.error('Database error during order creation', { error });
        throw new ServiceError('Failed to create order due to database error.');
    }
};

const updateOrderService = async (id: string, updates: unknown) => {
    const parsedUpdates = OrderSchema.partial().safeParse(updates);
    if (!parsedUpdates.success) {
        throw new ValidationError('Invalid order update data: ' + parsedUpdates.error.errors.map(e => e.message).join(', '));
    }
    const existingOrder = await queryDatabase('SELECT * FROM orders WHERE id = $1', [id]);
    if (existingOrder.rowCount === 0) {
        throw new NotFoundError('Order not found.');
    }
    try {
        const updatedOrder = await queryDatabase('UPDATE orders SET type = COALESCE($2, type), price = COALESCE($3, price), quantity = COALESCE($4, quantity), status = COALESCE($5, status) WHERE id = $1 RETURNING *', [id, updates.type, updates.price, updates.quantity, updates.status]);
        logger.info('Order updated successfully', { order: updatedOrder.rows[0] });
        return updatedOrder.rows[0];
    } catch (error) {
        logger.error('Database error during order update', { error });
        throw new ServiceError('Failed to update order due to database error.');
    }
};

const deleteOrderService = async (id: string) => {
    try {
        const result = await queryDatabase('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            throw new NotFoundError('Order not found.');
        }
        logger.info('Order deleted successfully', { id });
    } catch (error) {
        logger.error('Database error during order deletion', { error });
        throw new ServiceError('Failed to delete order due to database error.');
    }
};

const getOrdersService = async ({ limit = 10, offset = 0, status }: { limit?: number; offset?: number; status?: string }) => {
    const statusFilter = status ? 'WHERE status = $3' : '';
    try {
        const orders = await queryDatabase(`SELECT * FROM orders ${statusFilter} LIMIT $1 OFFSET $2`, [limit, offset, status]);
        logger.info('Fetched orders successfully', { count: orders.rowCount });
        return orders.rows;
    } catch (error) {
        logger.error('Database error during fetching orders', { error });
        throw new ServiceError('Failed to fetch orders due to database error.');
    }
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService };