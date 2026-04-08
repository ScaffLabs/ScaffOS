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