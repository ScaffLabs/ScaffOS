// Import necessary modules
import { Request, Response } from 'express';
import { getAggregatedData } from './dataAggregator';
import { ServiceError, ValidationError, NotFoundError } from './errorClasses';
import InMemoryStore from './dataStore';
import { LatencyDataSchema } from './types';

const store = new InMemoryStore<{ value: number }>();

/**
 * List all dashboard entries with optional pagination, filtering, and sorting.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
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

/**
 * Create a new dashboard entry.
 * @param {Request} req - The request object containing the entry details.
 * @param {Response} res - The response object.
 */
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

/**
 * Update an existing dashboard entry.
 * @param {Request} req - The request object containing the entry ID and updated data.
 * @param {Response} res - The response object.
 */
export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bodyValidation = LatencyDataSchema.pick({ value: true }).safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data.');
        }

        const existingEntry = store.read(id);
        if (!existingEntry) {
            throw new NotFoundError('Entry not found.');
        }

        store.update(id, { value: bodyValidation.data.value });
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

/**
 * Delete a dashboard entry.
 * @param {Request} req - The request object containing the entry ID.
 * @param {Response} res - The response object.
 */
export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
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
