import { Request, Response } from 'express';
import axios from 'axios';
import os from 'os';
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

    static async memoryUsage() {
        const memoryUsage = process.memoryUsage();
        return {
            rss: memoryUsage.rss,
            heapTotal: memoryUsage.heapTotal,
            heapUsed: memoryUsage.heapUsed,
            external: memoryUsage.external,
            total: os.totalmem(),
            free: os.freemem(),
        };
    }

    static async checkHealth(req: Request, res: Response) {
        const services = ['WEBHOOK', 'EMAIL'];
        const health = await this.checkExternalServices(services);
        const memory = await this.memoryUsage();
        return res.json({ services: health, memory });
    }

    static async checkReady(req: Request, res: Response) {
        const dbStatus = true; // Mocked DB status, replace with actual DB check if needed
        const services = await this.checkExternalServices(['WEBHOOK', 'EMAIL']);
        return res.json({ ready: dbStatus && services.WEBHOOK && services.EMAIL });
    }
}