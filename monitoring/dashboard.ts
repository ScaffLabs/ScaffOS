import { Request, Response } from 'express';
import { getAggregatedData } from './dataAggregator';
import { ServiceError, ValidationError } from './errorClasses';
import InMemoryStore from './dataStore';

const store = new InMemoryStore<any>();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: List dashboard entries
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of entries to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of entries to skip
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort by a specific field
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter results based on a property
 *     responses:
 *       200:
 *         description: A list of dashboard entries
 *       500:
 *         description: Internal server error
 */
export const listDashboardEntries = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0, sort, filter } = req.query;
        let entries = Array.from(store.storage.values());

        // Apply filtering
        if (filter) {
            entries = entries.filter(entry => entry.data.someProperty.includes(filter));
        }

        // Apply sorting
        if (sort) {
            entries.sort((a, b) => (a.data[sort] > b.data[sort] ? 1 : -1));
        }

        // Pagination
        const paginatedEntries = entries.slice(Number(offset), Number(offset) + Number(limit));
        if (paginatedEntries.length === 0) {
            throw new ServiceError('No entries found.');
        }
        res.status(200).json(paginatedEntries);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

/**
 * @swagger
 * /dashboard:
 *   post:
 *     summary: Create a new dashboard entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               value:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Dashboard entry created
 *       400:
 *         description: Invalid input data
 */
export const createDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id, value } = req.body;
        if (!id || !value) {
            throw new ValidationError('Invalid input data. ID and value are required.');
        }
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
 * @swagger
 * /dashboard/{id}:
 *   put:
 *     summary: Update a dashboard entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the entry to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Entry updated
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Entry not found
 */
export const updateDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { value } = req.body;
        if (!value) {
            throw new ValidationError('Invalid input data. Value is required.');
        }
        store.update(id, { value });
        res.status(204).send();
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(404).json({ error: 'Entry not found' });
        }
    }
};

/**
 * @swagger
 * /dashboard/{id}:
 *   delete:
 *     summary: Delete a dashboard entry
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the entry to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Entry deleted
 *       404:
 *         description: Entry not found
 */
export const deleteDashboardEntry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        store.delete(id);
        res.status(204).send();
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            res.status(404).json({ error: 'Entry not found' });
        }
    }
};