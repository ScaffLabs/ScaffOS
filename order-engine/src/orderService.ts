import { Order, OrderSchema } from './types';
import { ServiceError, ValidationError, NotFoundError } from './errors';
import { queryDatabase } from './db';
import { postData, fetchData } from './axiosClient';
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
        await postData(process.env.ORDER_SERVICE_URL + '/orders', order);
        return createdOrder.rows[0];
    } catch (error) {
        logger.error('Database error during order creation', { error });
        throw new ServiceError('Failed to create order due to database error.');
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

const fetchAllOrders = async () => {
    try {
        const response = await fetchData(process.env.ORDER_SERVICE_URL + '/orders');
        return response.data;
    } catch (error) {
        logger.error('Failed to fetch all orders from external service', { error });
        throw new ServiceError('Failed to fetch orders from external service.');
    }
};

export { createOrderService, getOrdersService, fetchAllOrders };