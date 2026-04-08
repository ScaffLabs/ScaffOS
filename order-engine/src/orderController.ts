import { Request, Response } from 'express';
import { Order } from './types';
import { storage } from './storage';
import { ValidationError, NotFoundError } from './errors';
import { createOrderService, updateOrderService, deleteOrderService, getOrdersService } from './orderService';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const order: Order = req.body;
        const createdOrder = await createOrderService(order);
        res.status(201).json(createdOrder);
    } catch (error) {
        handleError(res, error);
    }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const orders = await getOrdersService();
        res.status(200).json(orders);
    } catch (error) {
        handleError(res, error);
    }
};

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedOrder = await updateOrderService(id, updates);
        res.status(200).json(updatedOrder);
    } catch (error) {
        handleError(res, error);
    }
};

export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await deleteOrderService(id);
        res.status(204).send();
    } catch (error) {
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