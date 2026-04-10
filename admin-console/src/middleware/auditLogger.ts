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
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    if (req.method === 'POST' && req.path === '/api/config') {
        const { key } = req.body;
        auditLogger.info(`Configuration created: {key: ${key}, requestId: ${requestId}}`);
    } else if (req.method === 'DELETE' && req.path.startsWith('/api/config/')) {
        const key = req.path.split('/').pop();
        auditLogger.info(`Configuration deleted: {key: ${key}, requestId: ${requestId}}`);
    } else if (req.method === 'PUT' && req.path === '/api/config') {
        const { key } = req.body;
        auditLogger.info(`Configuration updated: {key: ${key}, requestId: ${requestId}}`);
    }
    next();
};