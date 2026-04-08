import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, '../logs/audit.log');

export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
    const { method, url, body, query } = req;
    const logEntry = `${new Date().toISOString()} - ${method} ${url} - Body: ${JSON.stringify(body)} - Query: ${JSON.stringify(query)}\n`;
    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) console.error('Failed to write to audit log:', err);
    });
    next();
};