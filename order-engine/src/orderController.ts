import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { storage } from './storage';
import { ValidationError, NotFoundError } from './errors';
import { emitOrderEvent } from './eventBus';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const result = OrderSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.errors.map(e => e.message).join(', '));
    }
    const order: Order = result.data;
    await storage.create(order);
    emitOrderEvent({ type: 'ORDER_CREATED', payload: order });
    res.status(201).json(order);
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    const result = OrderSchema.partial().safeParse(updates);
    if (!result.success) {
        throw new ValidationError(result.error.errors.map(e => e.message).join(', '));
    }
    const updatedOrder = await storage.update(id as string, result.data);
    if (!updatedOrder) {
        throw new NotFoundError('Order not found.');
    }
    emitOrderEvent({ type: 'ORDER_UPDATED', payload: updatedOrder });
    res.status(200).json(updatedOrder);
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await storage.delete(id as string);
    emitOrderEvent({ type: 'ORDER_DELETED', payload: { id }});
    res.status(204).send();
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await storage.findAll();
    res.status(200).json(orders);
};
