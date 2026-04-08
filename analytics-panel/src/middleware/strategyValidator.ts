import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateStrategy = (req: Request, res: Response, next: NextFunction) => {
    const { name, parameters } = req.body;
    if (!name || !validator.isAlphanumeric(name)) {
        return res.status(400).json({ error: 'Invalid strategy name. It must be alphanumeric.' });
    }
    if (!parameters || typeof parameters !== 'object') {
        return res.status(400).json({ error: 'Parameters must be an object.' });
    }
    req.body.name = validator.escape(name);
    req.body.parameters = parameters;
    next();
};