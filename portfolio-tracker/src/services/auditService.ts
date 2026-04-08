import fs from 'fs';
import path from 'path';

const auditLogPath = path.join(__dirname, '../logs/audit.log');

export const auditLog = async (action: string, data: any) => {
    const logEntry = `${new Date().toISOString()} - ${action}: ${JSON.stringify(data)}\n`;
    fs.appendFile(auditLogPath, logEntry, (err) => {
        if (err) {
            console.error('Error writing to audit log:', err);
        }
    });
};

export const logPortfolioCreation = async (portfolio) => {
    await auditLog('Portfolio Created', { id: portfolio.id, name: portfolio.name });
};

export const logPortfolioUpdate = async (portfolioId, update) => {
    await auditLog('Portfolio Updated', { id: portfolioId, changes: update });
};

export const logPortfolioDeletion = async (portfolioId) => {
    await auditLog('Portfolio Deleted', { id: portfolioId });
};