import { Request, Response } from 'express';
import { fetchData } from './axiosClient';
import { ServiceError } from './errors';

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
    try {
        const healthChecks = await Promise.all([
            checkDependentService(process.env.DATABASE_URL + '/health-check'),
            checkDependentService(process.env.ANOTHER_SERVICE_URL + '/health-check'),
            checkDependentService(process.env.ORDER_SERVICE_URL + '/health-check')
        ]);

        if (healthChecks.every(status => status)) {
            res.status(200).send('Order Engine is healthy!');
        } else {
            res.status(503).send('Dependent services are down.');
        }
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).send('Health check error.');
    }
};

export const readyCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        const readinessChecks = await Promise.all([
            checkDependentService(process.env.DATABASE_URL + '/ready-check'),
            checkDependentService(process.env.ANOTHER_SERVICE_URL + '/ready-check'),
            checkDependentService(process.env.ORDER_SERVICE_URL + '/ready-check')
        ]);

        if (readinessChecks.every(status => status)) {
            res.status(200).send('Order Engine is ready!');
        } else {
            res.status(503).send('Dependent services are not ready.');
        }
    } catch (error) {
        console.error('Readiness check failed:', error);
        res.status(500).send('Readiness check error.');
    }
};
