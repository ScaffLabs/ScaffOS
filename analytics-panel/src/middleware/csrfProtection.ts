import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';

const csrfProtection = csurf({ cookie: true });

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    csrfProtection(req, res, (err) => {
        if (err) return res.status(403).json({ error: 'CSRF token validation failed.' });
        next();
    });
};