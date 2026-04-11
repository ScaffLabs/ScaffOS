import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';
import { publishEvent } from '../utils/eventBus';

const positionStore = new InMemoryStore<Position>();

export const fetchPositions = async (req: Request, res: Response) => {
    const { limit = '10', offset = '0', sort = 'asc' } = req.query;
    const parsedLimit = parseInt(limit as string);
    const parsedOffset = parseInt(offset as string);

    if (isNaN(parsedLimit) || isNaN(parsedOffset) || parsedLimit <= 0) {
        return res.status(400).json({ message: 'Invalid pagination parameters' });
    }

    const positions = Object.values(positionStore.data);
    const sortedPositions = positions.sort((a, b) => {
        return sort === 'desc' ? b.quantity - a.quantity : a.quantity - b.quantity;
    });

    const paginatedPositions = sortedPositions.slice(parsedOffset, parsedOffset + parsedLimit);
    res.status(200).json(paginatedPositions);
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        const validationResult = PositionSchema.safeParse(positionData);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data: ' + validationResult.error.errors.join(', '));
        }
        const newPosition: Position = validationResult.data;
        positionStore.create(newPosition);
        publishEvent('POSITION_UPDATED', newPosition);
        res.status(201).json({ message: 'Position created successfully', position: newPosition });
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