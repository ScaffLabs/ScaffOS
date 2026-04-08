import { Request, Response } from 'express';
import { fetchData } from './axiosClient';
import { performance } from 'perf_hooks';

const checkServiceHealth = async (url: string) => {
    try {
        const response = await fetchData(url);
        return response.status === 200;
    } catch (error) {
        console.error(`Service at ${url} is down:`, error);
        return false;
    }
};

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        const checks = await Promise.all([
            checkServiceHealth(process.env.DATABASE_URL + '/health'),
            checkServiceHealth(process.env.ANOTHER_SERVICE_URL + '/health'),
            checkServiceHealth(process.env.ORDER_SERVICE_URL + '/health')
        ]);
        if (checks.every(status => status)) {
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
    const start = performance.now();
    try {
        const readinessChecks = await Promise.all([
            checkServiceHealth(process.env.DATABASE_URL + '/ready'),
            checkServiceHealth(process.env.ANOTHER_SERVICE_URL + '/ready'),
            checkServiceHealth(process.env.ORDER_SERVICE_URL + '/ready')
        ]);
        const duration = performance.now() - start;
        console.log(`Readiness check duration: ${duration}ms`);
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