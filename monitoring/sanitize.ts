import { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorClasses';
import { z } from 'zod';
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

const querySchema = z.object({
    limit: z.string().optional().transform((val) => Number(val)),
    offset: z.string().optional().transform((val) => Number(val)),
});

const bodySchema = z.object({
    id: z.string().nonempty().trim(),
    value: z.number().int().nonnegative(),
});

const sanitizeOutput = (data: any) => {
    if (data) {
        return JSON.parse(JSON.stringify(data).replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }
    return data;
};

const sanitize = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Sanitize body input
        if (req.body) {
            const bodyValidation = bodySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                throw new ValidationError('Invalid body data.');
            }
            req.body = bodyValidation.data;
        }

        // Validate and sanitize query parameters
        const parsedQuery = querySchema.parse(req.query);
        req.query.limit = parsedQuery.limit;
        req.query.offset = parsedQuery.offset;

        // Sanitize output for response
        res.send = ((send) => {
            return function (data) {
                if (data) {
                    data = sanitizeOutput(data);
                }
                return send.call(this, data);
            };
        })(res.send);

        next();
    } catch (error) {
        if (error instanceof ValidationError) {
            res.status(400).json({ error: error.message });
        } else {
            next(error);
        }
    }
};

export { sanitize, csrfProtection };