import { Request, Response } from 'express';
import os from 'os';
import { logPerformance } from '../logger';
import { healthCheckHandler as dependentHealthCheckHandler } from './dependentHealthCheck';

export const healthCheckHandler = async (req: Request, res: Response) => {
    try {
        const healthStatus = {
            status: 'ok',
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: os.cpus(),
            timestamp: new Date(),
        };
        logPerformance('Health Check', 0);
        res.status(200).json(healthStatus);
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({ error: 'Health check failed.' });
    }
};

export const dependentHealthCheckHandler = async (req: Request, res: Response) => {
    try {
        const dependencies = await dependentHealthCheck();
        const allHealthy = dependencies.every(dep => dep.healthy);
        logPerformance('Dependent Health Check', allHealthy ? 0 : 1);
        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ready' : 'not ready',
            dependencies,
        });
    } catch (error) {
        console.error('Dependent health check failed:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};