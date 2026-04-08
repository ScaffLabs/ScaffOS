import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';

export const validateInput = (req: Request, res: Response, next: NextFunction) => {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new ValidationError('Invalid quantity');
    }
    next();
};

export const validatePositionId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!validator.isUUID(id)) {
        throw new ValidationError('Invalid position ID');
    }
    next();
};