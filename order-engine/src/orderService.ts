import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { queryDatabase } from './db';
import logger from './logger';
import { fetchData } from './axiosClient';

const createOrderService = async (orderData: unknown) => {
    const parsedOrder = OrderSchema.safeParse(orderData);
    if (!parsedOrder.success) {
        throw new ValidationError('Invalid order data: ' + parsedOrder.error.errors.map(e => e.message).join(', '));
    }
    const order = parsedOrder.data;
    const createdOrder = await queryDatabase('INSERT INTO orders (id, type, price, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *', [order.id, order.type, order.price, order.quantity, order.status]);
    return createdOrder.rows[0];
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
    const updatedOrder = await queryDatabase('UPDATE orders SET type = COALESCE($2, type), price = COALESCE($3, price), quantity = COALESCE($4, quantity), status = COALESCE($5, status) WHERE id = $1 RETURNING *', [id, updates.type, updates.price, updates.quantity, updates.status]);
    return updatedOrder.rows[0];
};

const deleteOrderService = async (id: string) => {
    const existingOrder = await queryDatabase('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    if (existingOrder.rowCount === 0) {
        throw new NotFoundError('Order not found.');
    }
};

const getOrdersService = async ({ limit = 10, offset = 0, status }: { limit?: number; offset?: number; status?: string }) => {
    const statusFilter = status ? 'WHERE status = $3' : '';
    const orders = await queryDatabase(`SELECT * FROM orders ${statusFilter} LIMIT $1 OFFSET $2`, [limit, offset, status]);
    return orders.rows;
};

const checkOtherServices = async () => {
    try {
        await fetchData(process.env.ANOTHER_SERVICE_URL + '/health');
        await fetchData(process.env.ORDER_SERVICE_URL + '/health');
    } catch (error) {
        logger.error('Dependent services are not reachable:', error);
        throw new ServiceError('Dependent services are down.');
    }
};

export { createOrderService, updateOrderService, deleteOrderService, getOrdersService, checkOtherServices };