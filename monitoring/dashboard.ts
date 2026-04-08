import { Request, Response } from 'express';
import { ValidationError, NotFoundError, ServiceError } from './errorClasses';
import { LatencyData, LatencyDataSchema } from './types';
import logger from './logger';
import { createConnectionPool } from './connectionPool';
import { serviceEmitter } from './connectionPool';

const connectionPool = createConnectionPool();

// List Dashboard Entries with pagination and filtering
export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const response = await connectionPool.requestWithRetry('order', 'get', `/dashboard?limit=${limit}&offset=${offset}`);
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

// Create Dashboard Entry with validation
export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse({ ...req.body, timestamp: new Date() });
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both path and duration are required.');
        }
        const { path, duration, timestamp } = bodyValidation.data;
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