import { Request, Response } from 'express';
import { Order } from './types';
import { storage } from './storage';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';
import { ValidationError, NotFoundError } from './errors';
import logger from './logger';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    try {
        const order: Order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
        logger.info('Order created successfully', { requestId, order: createdOrder });
    } catch (error) {
        logger.error('Failed to create order', { error: error.message, requestId });
        handleError(res, error);
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    try {
        const orders = await getOrdersService();
        res.status(200).json(orders);
        logger.info('Retrieved orders successfully', { requestId, count: orders.length });
    } catch (error) {
        logger.error('Failed to retrieve orders', { error: error.message, requestId });
        handleError(res, error);
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedOrder = await updateOrderService(id, updates);
        res.status(200).json(updatedOrder);
        logger.info('Order updated successfully', { requestId, order: updatedOrder });
    } catch (error) {
        logger.error('Failed to update order', { error: error.message, requestId });
        handleError(res, error);
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = req.headers['x-request-id'] || generateRequestId();
    try {
        const { id } = req.params;
        await deleteOrderService(id);
        res.status(204).send();
        logger.info('Order deleted successfully', { requestId, id });
    } catch (error) {
        logger.error('Failed to delete order', { error: error.message, requestId });
        handleError(res, error);
    }
};

const handleError = (res: Response, error: Error) => {
    if (error instanceof ValidationError) {
        return res.status(400).json({ message: error.message });
    }
    if (error instanceof NotFoundError) {
        return res.status(404).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
};

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};
