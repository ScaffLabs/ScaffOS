import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';
import { closePool } from './connectionPool';

export const healthCheck = async (req: Request, res: Response) => {
    const serviceHealth = await fetchServiceHealth();
    res.status(serviceHealth.status === 'UP' ? 200 : 500).send(serviceHealth);
};

export const readinessCheck = async (req: Request, res: Response) => {
    // Implement readiness logic here, e.g., check if dependencies are available.
    try {
        const serviceHealth = await fetchServiceHealth();
        if (serviceHealth.status !== 'UP') {
            return res.status(503).send({ status: 'DOWN', details: serviceHealth });
        }
        res.status(200).send({ status: 'READY' });
    } catch (err) {
        res.status(503).send({ status: 'DOWN', error: err.message });
    }
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

export const registerHealthRoutes = (app: any) => {
    app.get('/api/health', healthCheck);
    app.get('/api/ready', readinessCheck);
};
