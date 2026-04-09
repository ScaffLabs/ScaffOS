import fs from 'fs';
import path from 'path';

const logFile = path.join(__dirname, 'audit.log');

export const logAudit = (action: string, details: any) => {
    const timestamp = new Date().toISOString();
    const filteredDetails = filterSensitiveData(details);
    const logEntry = `${timestamp} - ${action}: ${JSON.stringify(filteredDetails)}\n`;
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to audit log:', err);
        }
    });
};

const filterSensitiveData = (data: any) => {
    // Implement filtering logic to remove sensitive information
    const { password, token, ...filteredData } = data;
    return filteredData;
};

export const logError = (error: Error) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ERROR: ${error.message}\n`;
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to error log:', err);
        }
    });
};