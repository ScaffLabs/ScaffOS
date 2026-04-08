import { Request, Response } from 'express';
import { Order } from './types';
import { storage } from './storage';
import { ValidationError, NotFoundError } from './errors';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const order: Order = req.body;
    if (!order || !order.id || !order.type || !order.price || !order.quantity) {
        throw new ValidationError('Missing required fields in order.');
    }
    await storage.create(order);
    res.status(201).json(order);
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await storage.findAll();
    res.status(200).json(orders);
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    const updatedOrder = await storage.update(id, updates);
    if (!updatedOrder) {
        throw new NotFoundError('Order not found.');
    }
    res.status(200).json(updatedOrder);
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await storage.delete(id);
    res.status(204).send();
};