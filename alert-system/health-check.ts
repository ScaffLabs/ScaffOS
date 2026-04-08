import { Request, Response } from 'express';
import axios from 'axios';
import os from 'os';
import mongoose from 'mongoose';

export class HealthCheck {
    static async checkServices(services: string[]): Promise<{ [key: string]: boolean }> {
        const results: { [key: string]: boolean } = {};
        await Promise.all(services.map(async (service) => {
            try {
                const res = await axios.get(`${process.env[service + '_URL']}/health`);
                results[service] = res.status === 200;
            } catch (error) {
                console.error(`Health check for ${service} failed:`, error);
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
        const services = ['webhook', 'email'];
        const health = await this.checkServices(services);
        const memory = await this.memoryUsage();
        return res.json({ services: health, memory });
    }

    static async checkReady(req: Request, res: Response) {
        const dbStatus = mongoose.connection.readyState === 1;
        const services = await this.checkServices(['webhook', 'email']);
        return res.json({ ready: dbStatus && services.webhook && services.email });
    }

    static async checkMemoryUsage(req: Request, res: Response) {
        const memory = await this.memoryUsage();
        return res.json({ memory });
    }
}