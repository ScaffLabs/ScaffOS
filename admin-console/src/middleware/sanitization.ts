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