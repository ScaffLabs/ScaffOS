import express, { Request, Response, NextFunction } from 'express';
import { Queue } from 'bull';
import logger from './logger';
import { createOrder, getOrders, updateOrder, deleteOrder } from './orderController';

const orderQueue = new Queue('orderQueue');

const processQueue = async () => {
    orderQueue.process(async (job) => {
        const { action, payload } = job.data;
        switch (action) {
            case 'create':
                return await createOrder(payload);
            case 'update':
                return await updateOrder(payload);
            case 'delete':
                return await deleteOrder(payload);
            default:
                throw new Error('Unknown action');
        }
    });
};

export const setupRequestQueue = (app: express.Application) => {
    app.post('/orders', async (req: Request, res: Response, next: NextFunction) => {
        try {
            await orderQueue.add({ action: 'create', payload: req.body });
            res.status(202).send('Order is being processed');
        } catch (error) {
            logger.error('Error adding order to queue', { error: error.message });
            next(error);
        }
    });

    app.get('/orders', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orders = await getOrders(req, res);
            res.status(200).json(orders);
        } catch (error) {
            logger.error('Error retrieving orders', { error: error.message });
            next(error);
        }
    });

    processQueue();
};