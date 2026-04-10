import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, PositionSchema } from '../types';
import { ServiceError, ValidationError, NotFoundError } from '../utils/errors';

const positionStore = new InMemoryStore<Position>();

export const fetchPositions = async (req: Request, res: Response) => {
    const positions = Object.values(positionStore.data);
    res.status(200).json(positions);
};

export const createPosition = async (req: Request, res: Response) => {
    const positionData = req.body;
    try {
        const validationResult = PositionSchema.safeParse(positionData);
        if (!validationResult.success) {
            throw new ValidationError('Invalid position data: ' + validationResult.error.errors.join(', '));
        }
        positionStore.create(validationResult.data);
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
        positionStore.update(id, positionData);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
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
