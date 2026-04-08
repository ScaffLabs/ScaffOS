import { Request, Response } from 'express';
import { performance } from 'perf_hooks';

let memoryUsage = 0;

export const healthCheck = (req: Request, res: Response) => {
    res.status(200).send({ status: 'UP' });
};

export const readyCheck = (req: Request, res: Response) => {
    // Here you could include checks for external services
    res.status(200).send({ status: 'READY' });
};

export const monitorMemoryUsage = () => {
    const used = process.memoryUsage();
    memoryUsage = used.heapUsed / 1024 / 1024;
    console.log(`Memory usage: ${memoryUsage.toFixed(2)} MB`);
};
