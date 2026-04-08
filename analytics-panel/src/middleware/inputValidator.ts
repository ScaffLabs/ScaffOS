import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const validateQueryParams = (req: Request, res: Response, next: NextFunction) => {
    const { strategyA, strategyB } = req.query;
    if (!strategyA || !strategyB ||
        !validator.isAlphanumeric(strategyA.toString()) ||
        !validator.isAlphanumeric(strategyB.toString())) {
        return res.status(400).json({ error: 'Invalid query parameters. Strategy names must be alphanumeric.' });
    }
    req.query.strategyA = validator.escape(strategyA.toString());
    req.query.strategyB = validator.escape(strategyB.toString());
    next();
};
