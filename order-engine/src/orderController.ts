import { Request, Response } from 'express';
import { Order, OrderSchema } from './types';
import { storage } from './storage';
import { ValidationError, NotFoundError } from './errors';
import { emitOrderEvent } from './eventBus';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { logAudit } from './logger';

const orderRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        await body('id').isString().trim().escape().run(req);
        await body('type').isIn(['limit', 'market', 'stop']).run(req);
        await body('price').isNumeric().custom(value => { if (value <= 0) throw new Error('Price must be positive'); return true; }).run(req);
        await body('quantity').isInt({ gt: 0 }).run(req);
        await body('status').isIn(['open', 'filled', 'cancelled']).run(req);

        const result = validationResult(req);
        if (!result.isEmpty()) {
            throw new ValidationError(result.array().map(e => e.msg).join(', '));
        }

        const order: Order = req.body;
        await storage.create(order);
        logAudit('CREATE_ORDER', order.id);
        emitOrderEvent({ type: 'ORDER_CREATED', payload: order });
        res.status(201).json(order);
    } catch (error) {
        return handleError(res, error);
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
        return handleError(res, error);
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

export const orderRouter = (app: any) => {
    app.use(helmet());
    app.use(cors({ origin: ['http://allowed-origin.com'] }));
    app.use(orderRateLimiter);
    app.post('/orders', createOrder);
    app.get('/orders', getOrders);
};