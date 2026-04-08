import fs from 'fs';
import path from 'path';

const logFile = path.join(__dirname, 'audit.log');

export const logAudit = (action: string, details: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${action}: ${JSON.stringify(details)}\n`;
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to audit log:', err);
        }
    });
};

export const logSensitiveAction = (action: string, details: any) => {
    console.warn('Sensitive action logged:', action, details);
};