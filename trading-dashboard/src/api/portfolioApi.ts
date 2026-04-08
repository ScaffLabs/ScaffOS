import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import rateLimit from 'express-rate-limit';

const positionStore = new InMemoryStore<Position>();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});

/**
 * @swagger
 * /api/positions:
 *   get:
 *     summary: Get all positions
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Limit the number of results
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Offset for pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of positions
 *       500:
 *         description: Server error
 */
export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const positions = Object.values(positionStore.data).slice(offset, offset + limit);
        res.status(200).json(positions);
    } catch (error) {
        throw new ServiceError('Error fetching positions: ' + error.message);
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
 *             $ref: '#/components/schemas/Position'
 *     responses:
 *       201:
 *         description: Position created successfully
 *       400:
 *         description: Invalid position data
 */
export const createPosition = async (req: Request, res: Response) => {
    const position = req.body;
    const validationResult = PositionSchema.safeParse(position);
    if (!validationResult.success) {
        return res.status(400).json({ message: 'Invalid position data', errors: validationResult.error.errors });
    }
    try {
        const createdPosition = positionStore.create(validationResult.data);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        throw new ServiceError('Error creating position: ' + error.message);
    }
};

/**
 * @swagger
 * /api/positions/{id}:
 *   put:
 *     summary: Update an existing position
 *     parameters:
 *       - name: id
 *         in: path
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
 *         description: Position updated successfully
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Position not found
 */
export const updatePosition = async (req: Request, res: Response) => {
    const positionId = req.params.id;
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
    }
    try {
        const updatedPosition = positionStore.update(positionId, { quantity });
        if (!updatedPosition) {
            throw new NotFoundError('Position not found');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        throw new ServiceError('Error updating position: ' + error.message);
    }
};

/**
 * @swagger
 * /api/positions/{id}:
 *   delete:
 *     summary: Delete a position
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the position to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Position deleted successfully
 *       404:
 *         description: Position not found
 */
export const deletePosition = async (req: Request, res: Response) => {
    const positionId = req.params.id;
    try {
        const deleted = positionStore.delete(positionId);
        if (!deleted) {
            throw new NotFoundError('Position not found');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        throw new ServiceError('Error deleting position: ' + error.message);
    }
};

export const registerRoutes = (app) => {
    app.get('/api/positions', limiter, fetchPositions);
    app.post('/api/positions', createPosition);
    app.put('/api/positions/:id', updatePosition);
    app.delete('/api/positions/:id', deletePosition);
};