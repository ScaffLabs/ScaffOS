import { Request, Response } from 'express';
import { Order, OrderSchema } from '../types';
import { ServiceError } from '../utils/errors';
import logger from '../utils/logger';

const orders: Order[] = [];

/**
 * Submits a new order.
 * @param req - The request object containing order data.
 * @param res - The response object to send back data.
 */
export const submitOrder = async (req: Request, res: Response) => {
    const orderData = req.body;
    try {
        const validationResult = OrderSchema.safeParse(orderData);
        if (!validationResult.success) {
            throw new ServiceError('Invalid order details');
        }
        orders.push(validationResult.data);
        logger.info('Order submitted', { orderId: validationResult.data.id });
        res.status(201).json({ message: 'Order submitted successfully', order: validationResult.data });
    } catch (error) {
        logger.error('Error submitting order', { error: error.message });
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error submitting order' });
    }
};

/**
 * Registers the order routes with the provided app.
 * @param app - The Express application.
 */
export const registerOrderRoutes = (app: any) => {
    app.post('/api/orders', submitOrder);
};