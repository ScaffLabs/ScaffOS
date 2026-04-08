import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorClasses';

const sanitize = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body) {
            for (const key in req.body) {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key].trim().replace(/<[^>]*>/g, ''); // Basic XSS prevention
                }
            }
        }
        // Validate query parameters
        const { limit, offset } = req.query;
        if (limit && isNaN(Number(limit))) throw new ValidationError('Limit must be a number');
        if (offset && isNaN(Number(offset))) throw new ValidationError('Offset must be a number');
        next();
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
};

export { sanitize };