import { Request, Response, NextFunction } from 'express';
import logger from '../logger';
import validator from 'validator';

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url } = req;
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(method, url, res.statusCode, duration, req.id);
        // Log sensitive operations
        if (method === 'POST' && url.includes('/api/strategies')) {
            const { name } = req.body;
            logger.info(`Sensitive operation: Strategy created or updated: ${name}`);
        }
    });
    next();
};

export const validateInputBody = (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    if (contentType !== 'application/json') {
        return res.status(415).json({ error: 'Unsupported Media Type. Only application/json is allowed.' });
    }
    next();
};

export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 1048576) { // Limit to 1MB
        return res.status(413).json({ error: 'Payload too large. Maximum limit is 1MB.' });
    }
    next();
};

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