// Import necessary modules
import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import { ValidationError, NotFoundError } from './errors';
import logger from './logger';
import { validationResult } from 'express-validator';

// Retrieves all orders with optional pagination and sorting
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const { limit = 10, offset = 0, status, sortBy = 'price', sortOrder = 'asc' } = req.query;
    try {
        // Fetch orders based on provided query parameters
        const orders = await getOrdersService({ limit: parseInt(limit as string), offset: parseInt(offset as string), status, sortBy, sortOrder });
        // If no orders found, return a 404 response
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }
        // Return found orders with a 200 status
        res.status(200).json(orders);
        logger.info('Orders retrieved successfully', { count: orders.length, requestId: req.headers['x-request-id'] });
    } catch (error) {
        // Log error and return 500 if something goes wrong
        logger.error('Error retrieving orders', { error: error.message, requestId: req.headers['x-request-id'] });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Creates a new order based on request body
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    // Validate request body against the defined schema
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        // Parse and validate order data using Zod schema
        await OrderSchema.parseAsync(req.body);
        const order: Order = req.body;
        // Create order and return it with a 201 status
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { order: createdOrder, requestId: req.headers['x-request-id'] });
    } catch (error) {
        // Handle validation errors or log unexpected errors
        logger.error('Error creating order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof ValidationError) {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

// Updates an existing order
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    // Validate request body against the defined schema
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        // Parse incoming updates for partial order data
        await OrderSchema.partial().parseAsync(req.body);
        const updatedOrder = await updateOrderService(id, req.body);
        // Check if order exists before responding
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.status(200).json(updatedOrder);
        logger.info('Order updated successfully', { order: updatedOrder, requestId: req.headers['x-request-id'] });
    } catch (error) {
        // Log error and handle not found errors
        logger.error('Error updating order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

// Deletes an existing order
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        await deleteOrderService(id);
        // Return 204 No Content upon successful deletion
        res.status(204).send();
        logger.info('Order deleted successfully', { id, requestId: req.headers['x-request-id'] });
    } catch (error) {
        // Log error and handle not found errors
        logger.error('Error deleting order', { error: error.message, requestId: req.headers['x-request-id'] });
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};