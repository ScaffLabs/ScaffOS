import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import { closePool } from './connectionPool';

export const healthCheck = async (req: Request, res: Response) => {
    const serviceHealth = await fetchServiceHealth();
    res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
};

export const readyCheck = async (req: Request, res: Response) => {
    const serviceHealth = await fetchServiceHealth();
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
    closePool().then(() => {
        server.close(() => {
            console.log('Closed out remaining connections.');
            process.exit(0);
        });
    });
};

export const registerShutdownHandlers = (server: any) => {
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
    setInterval(monitorMemoryUsage, 60000); // Monitor memory usage every minute
};