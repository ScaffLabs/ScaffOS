import express, { Request, Response } from 'express';
import { AlertMessage } from './alert.schema';
import { alertStore } from './index';
import { ValidationError } from './error.types';

export class AlertController {
    private activeAlerts: AlertMessage[] = [];

    getActiveAlerts(req: Request, res: Response) {
        return res.json(this.activeAlerts);
    }

    addAlert(alert: AlertMessage) {
        this.activeAlerts.push(alert);
        alertStore.create(alert);
    }

    async healthCheck(req: Request, res: Response) {
        const isHealthy = true; // Implement health check logic
        return res.status(isHealthy ? 200 : 503).json({ healthy: isHealthy });
    }

    async readyCheck(req: Request, res: Response) {
        const isReady = true; // Implement readiness check logic
        return res.status(isReady ? 200 : 503).json({ ready: isReady });
    }
} 