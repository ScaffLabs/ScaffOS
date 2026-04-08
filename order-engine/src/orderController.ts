import { Request, Response } from 'express';
import { Order, OrderSchemas } from './types';
import { logAudit } from './logger';
import { storage } from './storage';
import { emitEvent } from './eventBus';
import { ValidationError, NotFoundError } from './errors';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

        if (!parsedResult.success) {
            throw new ValidationError(`Invalid order data: ${JSON.stringify(parsedResult.error.errors)}`);
        }

        const order: Order = parsedResult.data;
        await storage.create(order);
        logAudit('CREATE_ORDER', order.id);

        emitEvent({ type: 'ORDER_CREATED', payload: order });
        res.status(201).send(order);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to create order.' });
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await storage.findAll();
        if (!orders || orders.length === 0) {
            throw new NotFoundError('No orders found.');
        }
        res.status(200).json(orders);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to retrieve orders.' });
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const parsedResult = OrderSchemas.OrderSchema.partial().safeParse(req.body);

        if (!parsedResult.success) {
            throw new ValidationError(`Invalid order update data: ${JSON.stringify(parsedResult.error.errors)}`);
        }

        const updatedData = parsedResult.data;
        const existingOrder = await storage.read(id);

        if (!existingOrder) {
            throw new NotFoundError('Order not found.');
        }

        const updatedOrder = { ...existingOrder, ...updatedData };
        await storage.update(id, updatedOrder);
        logAudit('UPDATE_ORDER', updatedOrder.id);

        emitEvent({ type: 'ORDER_UPDATED', payload: updatedOrder });
        res.status(200).json(updatedOrder);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update order.' });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const existingOrder = await storage.read(id);

        if (!existingOrder) {
            throw new NotFoundError('Order not found.');
        }

        await storage.delete(id);
        logAudit('DELETE_ORDER', id);

        emitEvent({ type: 'ORDER_DELETED', payload: { id } });
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to delete order.' });
    }
};