import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import { LatencyDataSchema } from './types';
import logger from './logger';
import { createConnectionPool } from './connectionPool';

const connectionPool = createConnectionPool();

export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const response = await connectionPool.requestWithRetry('order', 'get', '/dashboard');
        if (!response || response.length === 0) {
            return res.status(204).json({ message: 'No entries available.' });
        }
        res.status(200).json(response);
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
};

export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both id and value are required.');
        }
        const { id, value } = bodyValidation.data;
        const response = await connectionPool.requestWithRetry('order', 'post', '/dashboard', { id, value });
        res.status(201).json({ message: 'Entry created', id: response.id });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.pick({ value: true }).safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data.');
        }
        const response = await connectionPool.requestWithRetry('order', 'put', `/dashboard/${id}`, bodyValidation.data);
        if (!response) {
            throw new NotFoundError('Entry not found.');
        }
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const response = await connectionPool.requestWithRetry('order', 'delete', `/dashboard/${id}`);
        if (!response) {
            throw new NotFoundError('Entry not found.');
        }
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};