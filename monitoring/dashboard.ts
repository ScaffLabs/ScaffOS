import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';
import { createConnectionPool } from './connectionPool';
import InMemoryStore from './dataStore';
import { LatencyData, LatencyDataSchema } from './types';

const connectionPool = createConnectionPool();
const store = new InMemoryStore<LatencyData>();

// List Dashboard Entries with pagination and filtering
export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const entries = store.getAll().slice(offset, offset + limit);
        if (entries.length === 0) {
            return res.status(204).json([]);
        }
        res.status(200).json(entries);
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
};

// Create Dashboard Entry with validation
export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both path and duration are required.');
        }
        const { path, duration } = bodyValidation.data;
        const timestamp = new Date();
        store.create({ path, duration, timestamp }, path);
        res.status(201).json({ message: 'Entry created', id: path });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Dashboard Entry
export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.partial().safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data.');
        }
        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        const updatedData = { ...existingEntry, ...bodyValidation.data };
        store.update(id, updatedData);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Dashboard Entry
export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        store.delete(id);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};