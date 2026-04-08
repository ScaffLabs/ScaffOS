import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, 'audit.log');

export const logAudit = (action: string, orderId: string) => {
  const timeStamp = new Date().toISOString();
  const logEntry = `${timeStamp} - ${action} - Order ID: ${orderId}\n`;
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to log audit entry:', err);
    }
  });
};

export const logError = (error: Error) => {
  const timeStamp = new Date().toISOString();
  const logEntry = `${timeStamp} - ERROR: ${error.message}\n`;
  fs.appendFile(logFilePath, logEntry, (err) => {
    if (err) {
      console.error('Failed to log error entry:', err);
    }
  });
};