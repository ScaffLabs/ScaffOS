import { Request, Response, NextFunction } from 'express';
import csurf from 'csurf';

const csrfProtection = csurf({ cookie: true });

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
    csrfProtection(req, res, (err) => {
        if (err) {
            return res.status(403).json({ message: 'CSRF token validation failed' });
        }
        next();
    });
};

export const getCsrfToken = (req: Request, res: Response) => {
    res.json({ csrfToken: req.csrfToken() });
};