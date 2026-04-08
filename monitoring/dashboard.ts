import { Request, Response } from 'express';
import { ValidationError, NotFoundError } from './errorClasses';
import InMemoryStore from './dataStore';
import { LatencyDataSchema } from './types';
import logger from './logger';
import { OrderId } from './types';
import { sanitize } from './sanitize';

const store = new InMemoryStore<{ value: number }>();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: List dashboard entries
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Limit the number of results
 *         required: false
 *         type: integer
 *       - name: offset
 *         in: query
 *         description: Offset for pagination
 *         required: false
 *         type: integer
 *     responses:
 *       200:
 *         description: A list of dashboard entries
 *       204:
 *         description: No entries available
 *   post:
 *     summary: Create a new dashboard entry
 *     parameters:
 *       - name: entry
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             value:
 *               type: integer
 *     responses:
 *       201:
 *         description: Entry created successfully
 *       400:
 *         description: Invalid input data
 */
export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;
        const entries = Array.from(store.getAll()).map(entry => ({ id: entry.id, data: entry.data }));

        const paginatedEntries = entries.slice(offset, offset + limit);
        if (paginatedEntries.length === 0) {
            return res.status(204).json({ message: 'No entries available.' });
        }
        res.status(200).json(paginatedEntries);
    } catch (error) {
        logger.error(error, req);
        res.status(500).json({ error: 'Failed to fetch entries.' });
    }
};

export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const bodyValidation = LatencyDataSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            throw new ValidationError('Invalid input data. Both id and value are required.');
        }
        const { id, value } = bodyValidation.data;
        if (store.read(id as OrderId)) {
            throw new ValidationError('Entry with this ID already exists.');
        }
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

export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!store.read(id as OrderId)) {
            throw new NotFoundError('Entry not found.');
        }
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