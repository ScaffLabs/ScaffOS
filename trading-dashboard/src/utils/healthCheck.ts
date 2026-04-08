import { Request, Response } from 'express';
import { fetchServiceHealth } from '../api/externalApi';

let memoryUsage = 0;

export const healthCheck = async (req: Request, res: Response) => {
    try {
        const externalServiceHealth = await fetchServiceHealth();
        res.status(200).send({ status: 'UP', memoryUsage, externalServiceHealth });
    } catch (error) {
        res.status(500).send({ status: 'DOWN', error: error.message });
    }
};

export const readyCheck = async (req: Request, res: Response) => {
    try {
        await fetchServiceHealth();
        res.status(200).send({ status: 'READY' });
    } catch (error) {
        res.status(500).send({ status: 'NOT READY', error: error.message });
    }
};

export const monitorMemoryUsage = () => {
    const used = process.memoryUsage();
    memoryUsage = used.heapUsed / 1024 / 1024;
    console.log(`Memory usage: ${memoryUsage.toFixed(2)} MB`);
};

export const gracefulShutdown = (server: any) => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Closed out remaining connections.');
        process.exit(0);
    });
};