import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';
import InMemoryStore from './dataStore';
import { DashboardEntry, DashboardEntrySchema } from './types';

const store = new InMemoryStore<DashboardEntry>();

export const listDashboardEntries = async (req: Request, res: Response): Promise<void> => {
    try {
        const entries = store.getAll();
        if (entries.length === 0) {
            return res.status(204).send();
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
            throw new ValidationError('Invalid input data: Both id and data are required.');
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

export const updateDashboardEntry = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const bodyValidation = DashboardEntrySchema.pick({ data: true }).safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data: Data is required.');
        }
        const { data } = bodyValidation.data;
        store.update(id, data);
        logger.info(`Updated entry: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Entry not found.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteDashboardEntry = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        store.delete(id);
        logger.info(`Deleted entry: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Entry not found.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
