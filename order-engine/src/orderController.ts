import { Request, Response } from 'express';
import { Order, OrderSchemas } from './types';
import { logAudit } from './logger';
import { storage } from './storage';
import { emitEvent } from './eventBus';
import { ValidationError, NotFoundError } from './errors';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate incoming order data against the defined schema
        const parsedResult = OrderSchemas.OrderSchema.safeParse(req.body);

        if (!parsedResult.success) {
            throw new ValidationError(`Invalid order data: ${JSON.stringify(parsedResult.error.errors)}`);
        }

        const order: Order = parsedResult.data;
        // Store the new order in memory
        await storage.create(order);
        logAudit('CREATE_ORDER', order.id);

        // Emit an event for the newly created order
        emitEvent({ type: 'ORDER_CREATED', payload: order });
        res.status(201).send(order);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle unexpected errors gracefully
        res.status(500).json({ message: 'Failed to create order.' });
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        // Retrieve all orders from storage
        const orders = await storage.findAll();
        if (!orders || orders.length === 0) {
            throw new NotFoundError('No orders found.');
        }
        res.status(200).json(orders);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        // Handle unexpected errors gracefully
        res.status(500).json({ message: 'Failed to retrieve orders.' });
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // Validate incoming update data against the defined schema
        const parsedResult = OrderSchemas.OrderSchema.partial().safeParse(req.body);

        if (!parsedResult.success) {
            throw new ValidationError(`Invalid order update data: ${JSON.stringify(parsedResult.error.errors)}`);
        }

        const updatedData = parsedResult.data;
        // Retrieve the existing order to update
        const existingOrder = await storage.read(id);

        if (!existingOrder) {
            throw new NotFoundError('Order not found.');
        }

        // Merge existing order with updated data
        const updatedOrder = { ...existingOrder, ...updatedData };
        await storage.update(id, updatedOrder);
        logAudit('UPDATE_ORDER', updatedOrder.id);

        // Emit an event for the updated order
        emitEvent({ type: 'ORDER_UPDATED', payload: updatedOrder });
        res.status(200).json(updatedOrder);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        // Handle unexpected errors gracefully
        res.status(500).json({ message: 'Failed to update order.' });
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        // Retrieve the existing order to delete
        const existingOrder = await storage.read(id);

        if (!existingOrder) {
            throw new NotFoundError('Order not found.');
        }

        // Delete the order from storage
        await storage.delete(id);
        logAudit('DELETE_ORDER', id);

        // Emit an event for the deleted order
        emitEvent({ type: 'ORDER_DELETED', payload: { id } });
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        // Handle unexpected errors gracefully
        res.status(500).json({ message: 'Failed to delete order.' });
    }
};