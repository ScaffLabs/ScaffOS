import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { ValidationError } from '../utils/errors';

export const validatePositionInput = (req: Request, res: Response, next: NextFunction) => {
    const { symbol, quantity } = req.body;
    if (typeof symbol !== 'string' || validator.isEmpty(symbol)) {
        throw new ValidationError('Invalid stock symbol');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
        throw new ValidationError('Invalid quantity');
    }
    req.body.symbol = validator.escape(symbol); // Escape to prevent XSS
    next();
};

export const validatePositionId = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    if (!validator.isUUID(id)) {
        throw new ValidationError('Invalid position ID');
    }
    next();
};