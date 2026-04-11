import { Request, Response } from 'express';
import { Order, OrderSchema } from '../types';
import { ServiceError } from '../utils/errors';
import logger from '../utils/logger';
import { publishEvent } from '../utils/eventBus';

const orders: Order[] = [];

/**
 * Submits a new order
 * @param req - HTTP request
 * @param res - HTTP response
 */
export const submitOrder = async (req: Request, res: Response) => {
    const orderData = req.body;
    try {
        const validationResult = OrderSchema.safeParse(orderData);
        if (!validationResult.success) {
            throw new ServiceError('Invalid order details: ' + validationResult.error.errors.join(', '));
        }
        const newOrder: Order = validationResult.data;
        orders.push(newOrder);
        logger.info('Order submitted', { orderId: newOrder.id });
        publishEvent('ORDER_SUBMITTED', newOrder);
        res.status(201).json({ message: 'Order submitted successfully', order: newOrder });
    } catch (error) {
        logger.error('Error submitting order', { error: error.message });
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error submitting order: ' + error.message });
    }
};

/**
 * Registers order-related API routes
 * @param app - Express application instance
 */
export const registerOrderRoutes = (app: any) => {
    app.post('/api/orders', submitOrder);
};