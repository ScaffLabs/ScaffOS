import { Request, Response, NextFunction } from 'express';
import { sanitizeBody, sanitizeQuery } from 'express-validator';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize body inputs
    sanitizeBody('id').trim().escape()(req, res, () => {});
    sanitizeBody('type').trim().escape()(req, res, () => {});
    sanitizeBody('price').toFloat()(req, res, () => {});
    sanitizeBody('quantity').toInt()(req, res, () => {});
    sanitizeBody('status').trim().escape()(req, res, () => {});

    // Sanitize query inputs
    for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
            req.query[key] = sanitize(req.query[key]);
        }
    }
    next();
};