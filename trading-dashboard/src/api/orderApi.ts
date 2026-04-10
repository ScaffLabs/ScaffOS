import { Request, Response } from 'express';
import { Order, OrderSchema } from '../types';
import { ServiceError } from '../utils/errors';
import logger from '../utils/logger';
import { publishEvent } from '../utils/eventBus';

const orders: Order[] = [];

export const submitOrder = async (req: Request, res: Response) => {
    const orderData = req.body;
    try {
        const validationResult = OrderSchema.safeParse(orderData);
        if (!validationResult.success) {
            throw new ServiceError('Invalid order details: ' + validationResult.error.errors.join(', '));
        }
        orders.push(validationResult.data);
        logger.info('Order submitted', { orderId: validationResult.data.id });
        publishEvent('ORDER_SUBMITTED', validationResult.data);
        res.status(201).json({ message: 'Order submitted successfully', order: validationResult.data });
    } catch (error) {
        logger.error('Error submitting order', { error: error.message });
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error submitting order: ' + error.message });
    }
};

export const registerOrderRoutes = (app: any) => {
    app.post('/api/orders', submitOrder);
};