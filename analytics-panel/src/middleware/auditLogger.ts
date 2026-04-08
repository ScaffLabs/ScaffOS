import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

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