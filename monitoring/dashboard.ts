import { Request, Response } from 'express';
import { getAggregatedData } from './dataAggregator';
import { ServiceError } from './errorClasses';

export const dashboard = async (req: Request, res: Response) => {
    try {
        const data = await getAggregatedData();
        if (!data || data.length === 0) {
            throw new ServiceError('No data available');
        }
        res.status(200).json(data);
    } catch (error) {
        if (error instanceof ServiceError) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};