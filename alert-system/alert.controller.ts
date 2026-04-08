import express, { Request, Response } from 'express';
import { AlertMessage, validateAlertMessage } from './alert.schema';
import { alertStore } from './index';
import { ValidationError, ServiceError } from './error.types';

export class AlertController {
    private activeAlerts: AlertMessage[] = [];

    getActiveAlerts(req: Request, res: Response) {
        try {
            return res.json(this.activeAlerts);
        } catch (error) {
            throw new ServiceError('Failed to fetch active alerts.');
        }
    }

    async addAlert(alertData: unknown) {
        try {
            const alert = validateAlertMessage(alertData);
            this.activeAlerts.push(alert);
            await alertStore.create(alert);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new ValidationError('Invalid alert data: ' + error.message);
            }
            throw new ServiceError('Failed to add alert.');
        }
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