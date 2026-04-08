import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import { closePool } from './connectionPool';

export const healthCheck = async (req: Request, res: Response) => {
    const serviceHealth = await fetchServiceHealth();
    res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
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
};