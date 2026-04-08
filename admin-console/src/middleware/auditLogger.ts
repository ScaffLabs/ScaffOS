import { Request, Response, NextFunction } from 'express';
import winston from 'winston';

const auditLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'audit.log' }),
    ],
});

export const logAudit = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST' && req.path === '/api/config') {
        // Log sensitive operation
        auditLogger.info(`Configuration created: {key: ${req.body.key}, user: ${req.user?.id}}`);
    }
    next();
};
