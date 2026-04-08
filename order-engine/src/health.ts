import { Request, Response } from 'express';
import { fetchData } from './axiosClient';

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        await fetchData('/health-check'); // Replace with the actual health check endpoint
        res.status(200).send('Order Engine is healthy!');
    } catch (error) {
        res.status(500).send('Dependent services are down.');
    }
};

export const readyCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        await fetchData('/ready-check'); // Replace with actual readiness check endpoint
        res.status(200).send('Order Engine is ready!');
    } catch (error) {
        res.status(500).send('Dependent services are not ready.');
    }
};