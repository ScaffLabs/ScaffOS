import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, 'audit.log');

const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url, body } = req;
    const sensitivePaths = ['/dashboard'];
    const isSensitive = sensitivePaths.includes(url);

    const logEntry = `${new Date().toISOString()} - ${method} ${url} - ${isSensitive ? '[SENSITIVE DATA REDACTED]' : JSON.stringify(body)}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write audit log:', err);
            return next(); // continue even if logging fails
        }
    });
    next();
};

export { auditLogger };