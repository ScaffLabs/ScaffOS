import { Request, Response } from 'express';
import os from 'os';

export class HealthCheck {
    static checkServices(services: string[]): boolean {
        // Logic to check the health of services
        return true;
    }

    static memoryUsage(req: Request, res: Response) {
        const memoryUsage = process.memoryUsage();
        return res.json({
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
            total: os.totalmem(),
            free: os.freemem(),
        });
    }
} 