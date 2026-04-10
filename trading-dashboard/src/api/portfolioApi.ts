import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import { publishEvent } from '../utils/eventBus';

const positionStore = new InMemoryStore<Position>();

export const fetchPositions = async (req: Request, res: Response) => {
    try {
        const positions = Object.values(positionStore.data);
        if (positions.length === 0) {
            return res.status(204).json([]);
        }
        res.status(200).json(positions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch positions: ' + error.message });
    }
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        const validationResult = PositionSchema.safeParse(positionData);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data: ' + validationResult.error.errors.join(', '));
        }
        positionStore.create(validationResult.data);
        publishEvent('POSITION_UPDATED', validationResult.data);
        res.status(201).json({ message: 'Position created successfully', position: validationResult.data });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating position: ' + error.message });
    }
};

export const updatePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    const positionData = req.body;
    try {
        const existingPosition = positionStore.read(id);
        if (!existingPosition) {
            throw new NotFoundError('Position not found.');
        }
        const validationResult = PositionSchema.safeParse(positionData);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data: ' + validationResult.error.errors.join(', '));
        }
        positionStore.update(id, validationResult.data);
        publishEvent('POSITION_UPDATED', validationResult.data);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating position: ' + error.message });
    }
};

export const deletePosition = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const success = positionStore.delete(id);
        if (!success) {
            throw new NotFoundError('Position not found.');
        }
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error deleting position: ' + error.message });
    }
};

export const registerRoutes = (app: any) => {
    app.get('/api/positions', fetchPositions);
    app.post('/api/positions', createPosition);
    app.put('/api/positions/:id', updatePosition);
    app.delete('/api/positions/:id', deletePosition);
};