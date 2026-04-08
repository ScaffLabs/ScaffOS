import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorClasses';
import { z } from 'zod';

const querySchema = z.object({
    limit: z.string().optional().transform((val) => Number(val)),
    offset: z.string().optional().transform((val) => Number(val)),
});

const sanitize = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Sanitize body input
        if (req.body) {
            for (const key in req.body) {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = req.body[key].trim().replace(/<[^>]*>/g, ''); // Basic XSS prevention
                }
            }
        }

        // Validate and sanitize query parameters
        const parsedQuery = querySchema.parse(req.query);
        req.query.limit = parsedQuery.limit;
        req.query.offset = parsedQuery.offset;

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