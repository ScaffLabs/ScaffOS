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
    // Validate request body against defined rules
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        throw new ValidationError('Validation failed: ' + validationErrors.array().map(e => e.msg).join(', '));
    }
    try {
        const order = req.body;
        const createdOrder = await createOrderService(order);
        // Respond with the created order and a success status
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { order });
    } catch (error) {
        logger.error('Error creating order', { error: error.message });
        // Handle known error types separately for better feedback
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
    try {
        const updatedOrder = await updateOrderService(id, updates);
        if (!updatedOrder) {
            throw new NotFoundError('Order not found.');
        }
        // Respond with the updated order
        res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error('Error updating order', { error: error.message });
        // Handle not found errors specifically
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// More functions (like deleteOrder and getOrders) would go here with similar inline comments.