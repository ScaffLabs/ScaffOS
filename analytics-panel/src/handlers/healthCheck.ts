import { Request, Response } from 'express';

export const healthCheckHandler = (req: Request, res: Response) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date(),
    };
    res.status(200).json(healthStatus);
};
