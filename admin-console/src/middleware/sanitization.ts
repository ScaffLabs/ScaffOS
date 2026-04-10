import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

export const sanitizeQueryParams = (req: Request, res: Response, next: NextFunction) => {
    const sanitizedQuery: { [key: string]: string } = {};
    for (const key in req.query) {
        if (Object.hasOwnProperty.call(req.query, key)) {
            sanitizedQuery[key] = sanitizeHtml(String(req.query[key]));
        }
    }
    req.query = sanitizedQuery;
    next();
};

export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
    if (req.body) {
        for (const key in req.body) {
            if (Object.hasOwnProperty.call(req.body, key)) {
                req.body[key] = sanitizeHtml(String(req.body[key]));
            }
        }
    }
    next();
};