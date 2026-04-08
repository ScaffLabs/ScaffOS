// orderController.ts
import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import { ValidationError, NotFoundError } from './errors';
import logger from './logger';
import { validationResult } from 'express-validator';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        await OrderSchema.parseAsync(req.body);
        const order: Order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { order: createdOrder, requestId: req.headers['x-request-id'] });
    } catch (error) {
        logger.error('Error creating order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof ValidationError) {
            res.status(400).json({ errors: error.errors });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await OrderSchema.partial().parseAsync(req.body);
        const updatedOrder = await updateOrderService(id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(updatedOrder);
        logger.info('Order updated successfully', { order: updatedOrder, requestId: req.headers['x-request-id'] });
    } catch (error) {
        logger.error('Error updating order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await deleteOrderService(id);
        res.status(204).send();
        logger.info('Order deleted successfully', { id, requestId: req.headers['x-request-id'] });
    } catch (error) {
        logger.error('Error deleting order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await getOrdersService();
        res.status(200).json(orders);
        logger.info('Orders retrieved successfully', { count: orders.length, requestId: req.headers['x-request-id'] });
    } catch (error) {
        logger.error('Error retrieving orders', { error: error.message, requestId: req.headers['x-request-id'] });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};