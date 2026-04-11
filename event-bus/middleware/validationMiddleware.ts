import { Request, Response, NextFunction } from 'express';
import { createEventSchema, updateEventSchema } from '../types';
import { ValidationError } from '../errors/validationError';

/**
 * Middleware for validating event creation requests.
 * @param req - The request object containing event data.
 * @param res - The response object to send validation errors.
 * @param next - The next middleware function.
 */
export const validateCreateEvent = (req: Request, res: Response, next: NextFunction) => {
    const validation = createEventSchema.safeParse(req.body);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    req.body = validation.data;
    next();
};

/**
 * Middleware for validating event update requests.
 * @param req - The request object containing updated event data.
 * @param res - The response object to send validation errors.
 * @param next - The next middleware function.
 */
export const validateUpdateEvent = (req: Request, res: Response, next: NextFunction) => {
    const validation = updateEventSchema.safeParse(req.body);
    if (!validation.success) {
        throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
    }
    req.body = validation.data;
    next();
};