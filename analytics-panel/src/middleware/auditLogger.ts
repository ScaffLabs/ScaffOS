import { Request, Response, NextFunction } from 'express';
import logger from '../logger';

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url } = req;
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(method, url, res.statusCode, duration);
        // Log sensitive data only if necessary, avoid logging sensitive information
        if (method === 'POST' && url.includes('/api/strategies')) {
            const { name } = req.body;
            logger.info(`Strategy created: ${name}`);
        }
    });
    next();
};