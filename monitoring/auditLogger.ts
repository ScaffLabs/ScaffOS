import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, 'audit.log');

const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url, body } = req;
    const logEntry = `${new Date().toISOString()} - ${method} ${url} - ${JSON.stringify(body)}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write audit log:', err);
        }
    });
    next();
};

export { auditLogger };