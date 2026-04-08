import { Request, Response } from 'express';
import os from 'os';
import { ServiceError } from '../errors/customErrors';

export const healthCheckHandler = async (req: Request, res: Response) => {
    try {
        const healthStatus = {
            status: 'ok',
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            timestamp: new Date(),
            cpuUsage: os.cpus(),
        };
        res.status(200).json(healthStatus);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ error: 'Health check failed.' });
    }
};

export const readyCheckHandler = async (req: Request, res: Response) => {
    try {
        // Additional checks can be added here (database connections, etc.)
        res.status(200).json({ status: 'ready' });
    } catch (error) {
        console.error('Ready check failed:', error);
        res.status(500).json({ error: 'Ready check failed.' });
    }
};
