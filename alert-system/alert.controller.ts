import express, { Request, Response } from 'express';
import { AlertMessage } from './alert.schema';
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

    async addAlert(alert: AlertMessage) {
        try {
            this.validateAlert(alert);
            this.activeAlerts.push(alert);
            await alertStore.create(alert);
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new ValidationError('Invalid alert data: ' + error.message);
            }
            throw new ServiceError('Failed to add alert.');
        }
    }

    private validateAlert(alert: AlertMessage) {
        if (!alert.type || !alert.threshold || !alert.currentValue) {
            throw new ValidationError('All fields are required.');
        }
        if (typeof alert.threshold !== 'number' || typeof alert.currentValue !== 'number') {
            throw new ValidationError('Threshold and current value must be numbers.');
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