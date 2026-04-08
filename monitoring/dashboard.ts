import { Request, Response } from 'express';
import { getAggregatedData } from './dataAggregator';
import { ServiceError, ValidationError, NotFoundError } from './errorClasses';
import InMemoryStore from './dataStore';
import { LatencyDataSchema } from './types';

const store = new InMemoryStore<{ value: number }>();

export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0, sort, filter } = req.query;
        let entries = Array.from(store.storage.values());

        // Validate pagination
        const parsedLimit = Number(limit);
        const parsedOffset = Number(offset);
        if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit < 0 || parsedOffset < 0) {
            throw new ValidationError('Limit and offset must be non-negative numbers.');
        }

        // Apply filtering
        if (filter) {
            entries = entries.filter(entry => entry.data.value && entry.data.value.toString().includes(filter));
        }

        // Apply sorting
        if (sort) {
            entries.sort((a, b) => (a.data[sort] > b.data[sort] ? 1 : -1));
        }

        // Pagination
        const paginatedEntries = entries.slice(parsedOffset, parsedOffset + parsedLimit);
        if (paginatedEntries.length === 0) {
            throw new NotFoundError('No entries found.');
        }
        res.status(200).json(paginatedEntries);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(500).json({ error: error.message });
        } else if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both id and value are required.');
        }

        const { id, value } = bodyValidation.data;
        store.create({ value }, id);
        res.status(201).json({ message: 'Entry created', id });
    } catch (error) {
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
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Value must be a non-negative number.');
        }

        const { value } = bodyValidation.data;
        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        store.update(id, { value });
        res.status(204).send();
    } catch (error) {
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
        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }
        store.delete(id);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};