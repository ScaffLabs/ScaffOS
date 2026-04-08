import { Request, Response } from 'express';
import { InMemoryStore } from '../storage/InMemoryStore';
import { Position, validatePosition } from '../types';
import { ServiceError, NotFoundError } from '../utils/errors';

const positionStore = new InMemoryStore<Position>();

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