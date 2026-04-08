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
        };
        res.status(200).json(healthStatus);
    } catch (error) {
        console.error('Health check failed:', error);
        throw new ServiceError('Health check failed.');
    }
};