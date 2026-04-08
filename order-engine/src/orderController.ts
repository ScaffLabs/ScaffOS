import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { storage } from './storage';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import { ValidationError, NotFoundError } from './errors';
import logger from './logger';
import { emitWithRetry } from './eventBus';
import { body, validationResult } from 'express-validator';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    await body('id').isString().notEmpty().run(req);
    await body('type').isIn(['limit', 'market', 'stop']).run(req);
    await body('price').isNumeric().isPositive().run(req);
    await body('quantity').isInt({ gt: 0 }).run(req);
    await body('status').isIn(['open', 'filled', 'cancelled']).run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const order: Order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        await emitWithRetry({ type: 'ORDER_CREATED', payload: createdOrder });
        logger.info('Order created successfully', { requestId, order: createdOrder });
    } catch (error) {
        logger.error('Failed to create order', { error: error.message, requestId });
        handleError(res, error);
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    const { id } = req.params;
    await body('type').optional().isIn(['limit', 'market', 'stop']).run(req);
    await body('price').optional().isNumeric().isPositive().run(req);
    await body('quantity').optional().isInt({ gt: 0 }).run(req);
    await body('status').optional().isIn(['open', 'filled', 'cancelled']).run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updates = req.body;
        const updatedOrder = await updateOrderService(id, updates);
        res.status(200).json(updatedOrder);
        await emitWithRetry({ type: 'ORDER_UPDATED', payload: updatedOrder });
        logger.info('Order updated successfully', { requestId, order: updatedOrder });
    } catch (error) {
        logger.error('Failed to update order', { error: error.message, requestId });
        handleError(res, error);
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    const { id } = req.params;
    try {
        await deleteOrderService(id);
        res.status(204).send();
        await emitWithRetry({ type: 'ORDER_DELETED', payload: { id } });
        logger.info('Order deleted successfully', { requestId, id });
    } catch (error) {
        logger.error('Failed to delete order', { error: error.message, requestId });
        handleError(res, error);
    }
};

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};