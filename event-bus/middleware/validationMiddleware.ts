import { Request, Response, NextFunction } from 'express';
import { createEventSchema, updateEventSchema } from '../types';
import { ValidationError } from '../errors/validationError';

export const validateCreateEvent = (req: Request, res: Response, next: NextFunction) => {
    const validation = createEventSchema.safeParse(req.body);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    req.body = validation.data;
    next();
};

export const validateUpdateEvent = (req: Request, res: Response, next: NextFunction) => {
    const validation = updateEventSchema.safeParse(req.body);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    req.body = validation.data;
    next();
};