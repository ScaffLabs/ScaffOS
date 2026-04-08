import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { storage } from './storage';
import { ValidationError, NotFoundError } from './errors';

/**
 * Create a new order.
 * @param req - The request object containing order data.
 * @param res - The response object to send data back.
 * @throws ValidationError if required fields are missing or invalid.
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const result = OrderSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.errors.map(e => e.message).join(', '));
    }
    const order: Order = result.data;
    await storage.create(order);
    res.status(201).json(order);
};

/**
 * Get all orders.
 * @param req - The request object.
 * @param res - The response object to send data back.
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await storage.findAll();
    res.status(200).json(orders);
};

/**
 * Update an existing order.
 * @param req - The request object containing updated order data.
 * @param res - The response object to send data back.
 * @throws NotFoundError if the order does not exist.
 */
export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    const result = OrderSchema.partial().safeParse(updates);
    if (!result.success) {
        throw new ValidationError(result.error.errors.map(e => e.message).join(', '));
    }
    const updatedOrder = await storage.update(id, result.data);
    if (!updatedOrder) {
        throw new NotFoundError('Order not found.');
    }
    res.status(200).json(updatedOrder);
};

/**
 * Delete an existing order.
 * @param req - The request object.
 * @param res - The response object to send data back.
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await storage.delete(id);
    res.status(204).send();
};
