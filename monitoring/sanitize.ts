import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorClasses';
import { z } from 'zod';

const querySchema = z.object({
    limit: z.string().optional().transform((val) => Number(val)),
    offset: z.string().optional().transform((val) => Number(val)),
});

const bodySchema = z.object({
    id: z.string().nonempty(),
    value: z.number().int().nonnegative(),
});

const sanitize = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Sanitize body input
        if (req.body) {
            const bodyValidation = bodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new ValidationError('Invalid body data.');
            }
            req.body = {
                id: bodyValidation.data.id.trim(),
                value: bodyValidation.data.value,
            };
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