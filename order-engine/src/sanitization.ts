import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Sanitize body inputs
    body('id').trim().escape()(req, res, () => {});
    body('type').trim().escape().isIn(['limit', 'market', 'stop'])(req, res, () => {});
    body('price').toFloat().isFloat({ gt: 0 })(req, res, () => {});
    body('quantity').toInt().isInt({ gt: 0 })(req, res, () => {});
    body('status').trim().escape().isIn(['open', 'filled', 'cancelled'])(req, res, () => {});

    // Sanitize query parameters
    for (const key in req.query) {
        if (typeof req.query[key] === 'string') {
            req.query[key] = req.query[key].replace(/<script.*?>.*?<\/script>/gi, '');
        }
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
};