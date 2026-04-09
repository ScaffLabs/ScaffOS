import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';
import { escape } from 'html-escaper';

// Validation middleware for creating an order
export const createOrderValidators = [
    body('id').isString().trim().escape().withMessage('ID must be a string'),
    body('type').isIn(['limit', 'market', 'stop']).withMessage('Type must be one of limit, market, or stop'),
    body('price').isNumeric().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['open', 'filled', 'cancelled']).withMessage('Status must be one of open, filled, or cancelled')
];

// Create Order
export const createOrder = [createOrderValidators, async (req: Request, res: Response) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        const order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { order: escape(JSON.stringify(createdOrder)) });
    } catch (error) {
        logger.error('Error creating order', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
}];

// Get Orders
export const getOrders = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, status } = req.query;
    try {
        const orders = await getOrdersService({ limit: Number(limit), offset: Number(offset), status });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }
        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error retrieving orders', { error: error.message });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update Order
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedOrder = await updateOrderService(id, updates);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error('Error updating order', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await deleteOrderService(id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting order', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Attach routes to the app
export const orderRouter = (app: any) => {
    app.post('/orders', createOrder);
    app.get('/orders', getOrders);
    app.put('/orders/:id', updateOrder);
    app.delete('/orders/:id', deleteOrder);
};