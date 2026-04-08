import { Request, Response } from 'express';
import { Order, OrderSchemas } from './types';
import { logAudit } from './logger';
import { storage } from './storage';
import { emitEvent } from './eventBus';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

    if (!parsedResult.success) {
        return res.status(400).json({ errors: parsedResult.error.errors });
    }

    const order: Order = parsedResult.data;
    await storage.create(order);
    logAudit('CREATE_ORDER', order.id);

    emitEvent({ type: 'ORDER_CREATED', payload: order });
    res.status(201).send(order);
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const orders = await storage.findAll();
    res.status(200).json(orders);
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const parsedResult = OrderSchemas.OrderSchema.partial().safeParse(req.body);

    if (!parsedResult.success) {
        return res.status(400).json({ errors: parsedResult.error.errors });
    }

    const updatedData = parsedResult.data;
    const existingOrder = await storage.read(id);

    if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const updatedOrder = { ...existingOrder, ...updatedData };
    await storage.update(id, updatedOrder);
    logAudit('UPDATE_ORDER', updatedOrder.id);

    emitEvent({ type: 'ORDER_UPDATED', payload: updatedOrder });
    res.status(200).json(updatedOrder);
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const existingOrder = await storage.read(id);

    if (!existingOrder) {
        return res.status(404).json({ message: 'Order not found' });
    }

    await storage.delete(id);
    logAudit('DELETE_ORDER', id);

    emitEvent({ type: 'ORDER_DELETED', payload: { id } });
    res.status(204).send();
};