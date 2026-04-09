import { Request, Response, NextFunction } from 'express';
import { sanitize as sanitizer } from 'express-validator';

export const sanitize = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        req.body = sanitizer(req.body);
    }
    if (req.query) {
        req.query = sanitizer(req.query);
    }
    if (req.params) {
        req.params = sanitizer(req.params);
    }
    next();
};
