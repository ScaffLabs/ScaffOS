import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError } from '../utils/errors';
import { initializeStore } from '../storage/migrations';

const positionStore = new InMemoryStore<Position>();
initializeStore(positionStore);

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Get positions with pagination, filtering, and sorting.
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of positions to return.
 *         required: false
 *         type: integer
 *       - name: offset
 *         in: query
 *         description: Starting point for the returned positions.
 *         required: false
 *         type: integer
 *       - name: sort
 *         in: query
 *         description: Sort order (e.g., 'quantity', '-quantity').
 *         required: false
 *         type: string
 *     responses:
 *       200:
 *         description: A list of positions.
 */
export const fetchPositions = async (req: Request, res: Response) => {
    const { limit = 10, offset = 0, sort } = req.query;
    if (isNaN(Number(limit)) || isNaN(Number(offset))) {
        return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    let positions = Object.values(positionStore.data);

    // Filtering
    const { symbol } = req.query;
    if (symbol) {
        positions = positions.filter(position => position.symbol === symbol);
    }

    // Sorting
    if (sort) {
        const [orderBy, order] = sort.startsWith('-') ? [sort.slice(1), 'desc'] : [sort, 'asc'];
        positions.sort((a, b) => {
            if (order === 'asc') return a[orderBy] > b[orderBy] ? 1 : -1;
            return a[orderBy] < b[orderBy] ? 1 : -1;
        });
    }

    const paginatedPositions = positions.slice(Number(offset), Number(offset) + Number(limit));
    res.status(200).json(paginatedPositions);
};

/**
 * @swagger
 * /api/positions:
 *   post:
 *     summary: Create a new position.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               symbol:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Position created successfully.
 *       400:
 *         description: Invalid position data.
 */
export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const createdPosition = positionStore.create(positionData);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: 'Invalid position data', errors: error.message });
        }
        throw new ServiceError('Error creating position: ' + error.message);
    }
};

/**
 * @swagger
 * /api/positions/{id}:
 *   put:
 *     summary: Update a position by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Position updated successfully.
 *       404:
 *         description: Position not found.
 *       400:
 *         description: Invalid input data.
 */
export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const updatedPosition = positionStore.update(id, positionData);
        if (!updatedPosition) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof ServiceError) {
            return res.status(400).json({ message: 'Invalid input data', errors: error.message });
        }
        return res.status(500).json({ message: 'Error updating position' });
    }
};

/**
 * @swagger
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete a position by ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       204:
 *         description: Position deleted successfully.
 *       404:
 *         description: Position not found.
 */
export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const isDeleted = positionStore.delete(id);
        if (!isDeleted) {
            return res.status(404).json({ message: 'Position not found' });
        }
        res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting position' });
    }
};

export const registerRoutes = (app: any) => {
    app.post('/api/positions', createPosition);
    app.get('/api/positions', fetchPositions);
    app.put('/api/positions/:id', updatePosition);
    app.delete('/api/positions/:id', deletePosition);
};