import { Request, Response } from 'express';
import { ValidationError, NotFoundError, ServiceError } from './errorClasses';
import { LatencyData, LatencyDataSchema } from './types';
import logger from './logger';
import { createConnectionPool } from './connectionPool';
import { serviceEmitter } from './connectionPool';

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
        if (error instanceof ServiceError) {
            return res.status(500).json({ error: 'Service unavailable.' });
        }
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
};

export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both id and value are required.');
        }
        const { path, duration } = bodyValidation.data;
        const timestamp = new Date();
        const response = await connectionPool.requestWithRetry('order', 'post', '/dashboard', { path, duration, timestamp });
        serviceEmitter.emit('latency_record', { path, duration, timestamp });
        res.status(201).json({ message: 'Entry created', id: response.id });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.pick({ duration: true }).safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data.');
        }
        await connectionPool.requestWithRetry('order', 'put', `/dashboard/${id}`, bodyValidation.data);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await connectionPool.requestWithRetry('order', 'delete', `/dashboard/${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};