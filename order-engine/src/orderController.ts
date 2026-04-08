// Import necessary modules
import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import { ValidationError, NotFoundError } from './errors';
import logger from './logger';
import { validationResult } from 'express-validator';

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retrieve all orders with pagination and filtering
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: 'price'
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: 'asc'
 *     responses:
 *       200:
 *         description: A list of orders
 *       404:
 *         description: No orders found
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const { limit = 10, offset = 0, status, sortBy = 'price', sortOrder = 'asc' } = req.query;
    try {
        const orders = await getOrdersService({ limit: parseInt(limit as string), offset: parseInt(offset as string), status, sortBy, sortOrder });
        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found.' });
        }
        res.status(200).json(orders);
        logger.info('Orders retrieved successfully', { count: orders.length, requestId: req.headers['x-request-id'] });
    } catch (error) {
        logger.error('Error retrieving orders', { error: error.message, requestId: req.headers['x-request-id'] });
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid order data
 */
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
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
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

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the order to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
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