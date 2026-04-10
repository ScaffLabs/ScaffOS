import { Request, Response, NextFunction } from 'express';
import { sanitize } from 'express-validator';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
            req.body[key] = sanitize(req.body[key]);
        }
    }
    for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
            req.query[key] = sanitize(req.query[key]);
        }
    }
    next();
};