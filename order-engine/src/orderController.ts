// Import necessary packages
import { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import logger from './logger';
import { ValidationError, NotFoundError } from './errors';

// Validation middleware for creating an order
export const createOrderValidators = [
    body('id').isString().trim().escape().withMessage('ID must be a string'),
    body('type').isIn(['limit', 'market', 'stop']).withMessage('Type must be one of limit, market, or stop'),
    body('price').isNumeric().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['open', 'filled', 'cancelled']).withMessage('Status must be one of open, filled, or cancelled')
];

// Validation middleware for getting orders
export const getOrdersValidators = [
    query('limit').optional().isInt({ gt: 0 }).withMessage('Limit must be a positive integer'),
    query('offset').optional().isInt({ gte: 0 }).withMessage('Offset must be a non-negative integer'),
    query('sort').optional().isIn(['price', 'quantity']).withMessage('Sort must be either price or quantity'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be either asc or desc')
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
        logger.info('Order created successfully', { order });
    } catch (error) {
        logger.error('Error creating order', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
}];

// Get Orders
export const getOrders = [getOrdersValidators, async (req: Request, res: Response) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        const sort = req.query.sort as string || 'price';
        const order = req.query.order as string || 'asc';
        const orders = await getOrdersService({ limit, offset, sort, order });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }
        res.status(200).json(orders);
    } catch (error) {
        logger.error('Error retrieving orders', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'No orders found.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
}];

// Update Order
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedOrder = await updateOrderService(id, updates);
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
