import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';
import InMemoryStore from './dataStore';
import { DashboardEntry, DashboardEntrySchema } from './types';
import { createConnectionPool } from './connectionPool';

const store = new InMemoryStore<DashboardEntry>();
const connectionPool = createConnectionPool();

export const listDashboardEntries = async (req: Request, res: Response): Promise<void> => {
    try {
        const entries = store.getAll();
        if (entries.length === 0) {
            return res.status(204).json([]);
        }
        res.status(200).json(entries);
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
};

export const createDashboardEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const bodyValidation = DashboardEntrySchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data.');
        }
        const { id, data } = bodyValidation.data;
        store.create(data, id);
        logger.info(`Created new entry: ${id}`);
        res.status(201).json({ message: 'Entry created', id });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const checkDashboardHealth = async (req: Request, res: Response): Promise<void> => {
    try {
        const healthStatus = await connectionPool.requestWithRetry('orderService', 'get', '/health');
        res.status(200).json({ status: healthStatus });
    } catch (error) {
        logger.error({ error: error.message }, 'Health check for dashboard failed');
        res.status(503).json({ error: 'Order service unavailable' });
    }
};