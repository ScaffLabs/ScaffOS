import { Request, Response } from 'express';
import { fetchData } from './axiosClient';

const checkDependentService = async (url: string) => {
    try {
        await fetchData(url);
        return true;
    } catch (error) {
        console.error(`Service at ${url} is down:`, error);
        return false;
    }
};

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    const isDatabaseHealthy = await checkDependentService(process.env.DATABASE_URL + '/health-check');
    const isAnotherServiceHealthy = await checkDependentService(process.env.ANOTHER_SERVICE_URL + '/health-check');

    if (isDatabaseHealthy && isAnotherServiceHealthy) {
        res.status(200).send('Order Engine is healthy!');
    } else {
        res.status(500).send('Dependent services are down.');
    }
};

export const readyCheck = async (req: Request, res: Response): Promise<void> => {
    const isDatabaseReady = await checkDependentService(process.env.DATABASE_URL + '/ready-check');
    const isAnotherServiceReady = await checkDependentService(process.env.ANOTHER_SERVICE_URL + '/ready-check');

    if (isDatabaseReady && isAnotherServiceReady) {
        res.status(200).send('Order Engine is ready!');
    } else {
        res.status(500).send('Dependent services are not ready.');
    }
};