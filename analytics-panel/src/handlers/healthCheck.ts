import { Request, Response } from 'express';
import { ServiceError } from '../errors/customErrors';

export const healthCheckHandler = async (req: Request, res: Response) => {
    try {
        const healthStatus = {
            status: 'ok',
            timestamp: new Date(),
        };
        res.status(200).json(healthStatus);
    } catch (error) {
        throw new ServiceError('Health check failed.');
    }
};