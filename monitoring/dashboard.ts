import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import InMemoryStore from './dataStore';
import { LatencyDataSchema } from './types';
import logger from './logger';
import { OrderId } from './types';

const store = new InMemoryStore<{ value: number }>();

/**
 * List all entries in the dashboard.
 * @param req - Express request object
 * @param res - Express response object
 * @returns - A JSON array of dashboard entries or a 204 status if no entries are found.
 */
export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const entries = Array.from(store.storage.values());
        if (entries.length === 0) {
            return res.status(204).json({ message: 'No entries available.' });
        }
        res.status(200).json(entries);
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
};

/**
 * Create a new dashboard entry.
 * @param req - Express request object containing id and value in the body.
 * @param res - Express response object
 * @returns - A message confirming the creation of the entry or an error.
 */
export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both id and value are required.');
        }
        const { id, value } = bodyValidation.data;
        store.create({ value }, id as OrderId);
        res.status(201).json({ message: 'Entry created', id });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

/**
 * Update an existing dashboard entry based on ID.
 * @param req - Express request object containing the ID in the params and new value in the body.
 * @param res - Express response object
 * @returns - 204 status on successful update or an error.
 */
export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.pick({ value: true }).safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data.');
        }
        const existingEntry = store.read(id as OrderId);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        store.update(id as OrderId, { value: bodyValidation.data.value });
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

/**
 * Delete a dashboard entry based on ID.
 * @param req - Express request object containing the ID in the params.
 * @param res - Express response object
 * @returns - 204 status on successful deletion or an error.
 */
export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        store.delete(id as OrderId);
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