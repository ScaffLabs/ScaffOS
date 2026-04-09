import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError, ValidationError } from '../utils/errors';
import rateLimit from 'express-rate-limit';

const positionStore = new InMemoryStore<Position>();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Retrieve all positions
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of positions
 *       400:
 *         description: Invalid pagination parameters
 */
export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        if (isNaN(Number(limit)) || isNaN(Number(offset))) {
            return res.status(400).json({ message: 'Invalid pagination parameters' });
        }
        let positions = Object.values(positionStore.data);
        const paginatedPositions = positions.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedPositions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching positions' });
    }
};

/**
 * @swagger
 * /api/positions:
 *   post:
 *     summary: Create a new position
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
 *         description: Position created successfully
 *       400:
 *         description: Invalid position data
 */
export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const createdPosition = positionStore.create(positionData);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Error creating position' });
    }
};

/**
 * @swagger
 * /api/positions/{id}:
 *   put:
 *     summary: Update a position by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the position to update
 *         schema:
 *           type: string
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
 *         description: Successfully updated
 *       404:
 *         description: Position not found
 *       400:
 *         description: Invalid quantity
 */
export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        validatePosition(positionData);
        const updatedPosition = positionStore.update(id, positionData);
        if (!updatedPosition) {
            throw new NotFoundError('Position not found');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Error updating position' });
    }
};

/**
 * @swagger
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete a position by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the position to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         description: Position not found
 */
export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = positionStore.delete(id);
        if (!deleted) {
            throw new NotFoundError('Position not found');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Error deleting position' });
    }
};

export const registerRoutes = (app: any) => {
    app.use('/api/positions', limiter);
    app.get('/', fetchPositions);
    app.post('/', createPosition);
    app.put('/:id', updatePosition);
    app.delete('/:id', deletePosition);
};