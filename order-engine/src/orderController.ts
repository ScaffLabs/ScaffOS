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
        logger.info('Audit Log: Created Order', { orderId: order.id, action: 'create' });
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

// Delete Order
export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await deleteOrderService(id);
        logger.info('Audit Log: Deleted Order', { orderId: id, action: 'delete' });
        res.status(204).send();
    } catch (error) {
        logger.error('Error deleting order', { error: error.message });
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};