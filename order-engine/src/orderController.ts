import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import { ValidationError, NotFoundError } from './errors';
import logger from './logger';

// Validation rules for creating an order
export const createOrderValidators = [
    body('id').isString().trim().escape().withMessage('ID must be a string'),
    body('type').isIn(['limit', 'market', 'stop']).withMessage('Type must be one of limit, market, or stop'),
    body('price').isNumeric().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['open', 'filled', 'cancelled']).withMessage('Status must be one of open, filled, or cancelled')
];

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        const order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { order });
    } catch (error) {
        logger.error('Error creating order', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Update an existing order
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        const updatedOrder = await updateOrderService(id, updates);
        if (!updatedOrder) {
            throw new NotFoundError('Order not found.');
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error('Error updating order', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Delete an order
export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await deleteOrderService(id);
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting order', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await getOrdersService({ limit: parseInt(req.query.limit as string) || 10, offset: parseInt(req.query.offset as string) || 0 });
        if (!orders.length) {
            return res.status(404).json({ message: 'No orders found.' });
        }
        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error retrieving orders', { error: error.message });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};