import { Request, Response } from 'express';
import { getAggregatedData } from './dataAggregator';

export const dashboard = (req: Request, res: Response) => {
    const data = getAggregatedData();
    res.status(200).json(data);
};