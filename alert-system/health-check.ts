import { Request, Response } from 'express';
import axios from 'axios';
import logger from './logger';

export class HealthCheck {
    static async checkExternalServices(services: string[]): Promise<{ [key: string]: boolean }> {
        const results: { [key: string]: boolean } = {};
        await Promise.all(services.map(async (service) => {
            try {
                const res = await axios.get(`${process.env[service + '_URL']}/health`);
                results[service] = res.status === 200;
            } catch (error) {
                logger.error(`Health check for ${service} failed: ${error.message}`);
                results[service] = false;
            }
        }));
        return results;
    }

    static async checkHealth(req: Request, res: Response) {
        const services = ['WEBHOOK', 'EMAIL'];
        const health = await this.checkExternalServices(services);
        return res.json({ services: health });
    }

    static async checkReady(req: Request, res: Response) {
        const services = await this.checkExternalServices(['WEBHOOK', 'EMAIL']);
        return res.json({ ready: services.WEBHOOK && services.EMAIL });
    }

    static async checkMemoryUsage(req: Request, res: Response) {
        const memoryUsage = process.memoryUsage();
        return res.json({
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
        });
    }
}
