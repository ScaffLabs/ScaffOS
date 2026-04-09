import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';
import InMemoryStore from './dataStore';
import { LatencyData, LatencyDataSchema } from './types';

const store = new InMemoryStore<LatencyData>();

/**
 * List all dashboard entries.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON array of dashboard entries or a 204 status if none.
 */
export const listDashboardEntries = async (req: Request, res: Response) => {
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

/**
 * Create a new dashboard entry.
 * @param req - The request object containing the entry data.
 * @param res - The response object.
 * @returns A message confirming the entry creation or an error status.
 */
export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse({ ...req.body, timestamp: new Date() });
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Please provide valid path and duration.');
        }
        const { path, duration } = bodyValidation.data;
        store.create({ path, duration, timestamp: new Date() }, path);
        logger.info(`Created new entry: ${path}`);
        res.status(201).json({ message: 'Entry created', id: path });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Update an existing dashboard entry.
 * @param req - The request object containing the entry ID and update data.
 * @param res - The response object.
 * @returns A 204 status for successful updates or an error status.
 */
export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.partial().safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Please ensure the fields are correct.');
        }
        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        const updatedData = { ...existingEntry, ...bodyValidation.data };
        store.update(id, updatedData);
        logger.info(`Updated entry: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Delete a dashboard entry.
 * @param req - The request object containing the entry ID.
 * @param res - The response object.
 * @returns A 204 status for successful deletion or an error status.
 */
export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        store.delete(id);
        logger.info(`Deleted entry: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};