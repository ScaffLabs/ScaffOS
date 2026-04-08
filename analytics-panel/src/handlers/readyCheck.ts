import { Request, Response } from 'express';

export const readyCheckHandler = async (req: Request, res: Response) => {
    try {
        // Simulate service checks here (e.g., database connection, external services)
        const services = [
            { name: 'Database', healthy: true },
            { name: 'External API', healthy: true }
        ];

        const allHealthy = services.every(service => service.healthy);
        res.status(allHealthy ? 200 : 503).json({
            status: allHealthy ? 'ready' : 'not ready',
            services
        });
    } catch (error) {
        console.error('Ready check failed:', error);
        res.status(500).json({ error: 'Ready check failed.' });
    }
};