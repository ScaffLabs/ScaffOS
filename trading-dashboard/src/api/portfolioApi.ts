import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import validator from 'validator';

const positionStore = new InMemoryStore<Position>();

/**
 * Fetches positions from the in-memory store.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A JSON array of positions.
 * @throws Will throw a ServiceError if fetching fails.
 */
export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        // Validate and sanitize query parameters
        const sanitizedLimit = validator.toInt(limit.toString());
        const sanitizedOffset = validator.toInt(offset.toString());
        const positions = Object.values(positionStore.data).slice(sanitizedOffset, sanitizedOffset + sanitizedLimit);
        res.status(200).json(positions);
    } catch (error) {
        throw new ServiceError('Error fetching positions: ' + error.message);
    }
};

/**
 * Creates a new position in the store.
 * @param req - The request object containing position data.
 * @param res - The response object.
 * @returns A JSON object confirming creation.
 * @throws Will throw a ValidationError if provided data is invalid.
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
 * Updates an existing position.
 * @param req - The request object containing the position ID and update data.
 * @param res - The response object.
 * @returns A JSON response with status 204 on success.
 * @throws Will throw a NotFoundError if the position is not found.
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
 * Deletes a position from the store.
 * @param req - The request object containing the position ID.
 * @param res - The response object.
 * @returns A JSON response with status 204 on success.
 * @throws Will throw a NotFoundError if the position is not found.
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

/**
 * Registers the API routes with the Express application.
 * @param app - The Express application instance.
 */
export const registerRoutes = (app) => {
    app.get('/api/positions', fetchPositions);
    app.post('/api/positions', createPosition);
    app.put('/api/positions/:id', updatePosition);
    app.delete('/api/positions/:id', deletePosition);
};
