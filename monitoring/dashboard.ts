import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import logger from './logger';
import InMemoryStore from './dataStore';
import { DashboardEntry, DashboardEntrySchema } from './types';

const store = new InMemoryStore<DashboardEntry>();

export const listDashboardEntries = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const entries = store.getAll();
        const paginatedEntries = entries.slice(Number(offset), Number(offset) + Number(limit));
        if (paginatedEntries.length === 0) {
            return res.status(204).json([]);
        }
        res.status(200).json(paginatedEntries);
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries. Please try again later.' });
    }
};

export const createDashboardEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const bodyValidation = DashboardEntrySchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data: ' + bodyValidation.error.errors.map(e => e.message).join(', '));
        }
        const { id, data } = bodyValidation.data;
        if (store.read(id)) {
            throw new ValidationError('Entry with this ID already exists.');
        }
        store.create(data, id);
        logger.info(`Created new entry: ${id}`);
        res.status(201).json({ message: 'Entry created', id });
    } catch (error) {
        logger.error(error, req);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
};

export const updateDashboardEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const bodyValidation = DashboardEntrySchema.partial().safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data: ' + bodyValidation.error.errors.map(e => e.message).join(', '));
        }
        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        const updatedData = { ...existingEntry.data, ...bodyValidation.data };
        store.update(id, updatedData);
        logger.info(`Updated entry: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(error, req);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
};

export const deleteDashboardEntry = async (req: Request, res: Response): Promise<void> => {
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
        res.status(500).json({ error: 'Internal Server Error. Please try again later.' });
    }
};