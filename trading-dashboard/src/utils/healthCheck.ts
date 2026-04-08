import { Request, Response } from 'express';
import { fetchServiceHealth, checkServiceHealth } from '../api/externalApi';

export const healthCheck = async (req: Request, res: Response) => {
    const serviceHealth = await checkServiceHealth();
    res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
};

export const readyCheck = async (req: Request, res: Response) => {
    const serviceHealth = await checkServiceHealth();
    if (serviceHealth.status === 'UP') {
        res.status(200).send({ status: 'READY' });
    } else {
        res.status(500).send({ status: 'NOT READY', error: serviceHealth.error });
    }
};

export const monitorMemoryUsage = () => {
    const used = process.memoryUsage();
    const memoryUsage = used.heapUsed / 1024 / 1024;
    console.log(`Memory usage: ${memoryUsage.toFixed(2)} MB`);
};

export const gracefulShutdown = (server: any) => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });
};
