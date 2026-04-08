import express, { Request, Response } from 'express';
import { AlertMessage, validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError, ServiceError, NotFoundError } from './error.types';

export class AlertController {
    private alertStore: AlertStore;

    constructor(alertStore: AlertStore) {
        this.alertStore = alertStore;
    }

    async getActiveAlerts(req: Request, res: Response) {
        try {
            const alerts = await this.alertStore.findIndex({});
            if (!alerts.length) return res.status(204).send();
            return res.json(alerts);
        } catch (error) {
            console.error(error);
            throw new ServiceError('Failed to fetch active alerts.');
        }
    }

    async addAlert(req: Request, res: Response) {
        try {
            const alert = validateAlertMessage(req.body);
            const createdAlert = await this.alertStore.create(alert);
            return res.status(201).json(createdAlert);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
            }
            console.error(error);
            throw new ServiceError('Failed to add alert.');
        }
    }

    async updateAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        try {
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) {
                throw new NotFoundError('Alert not found.');
            }
            return res.json(updatedAlert);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message });
            }
            console.error(error);
            throw new ServiceError('Failed to update alert.');
        }
    }

    async deleteAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        try {
            const deleted = await this.alertStore.delete(alertId);
            if (!deleted) {
                throw new NotFoundError('Alert not found.');
            }
            return res.status(204).send();
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message });
            }
            console.error(error);
            throw new ServiceError('Failed to delete alert.');
        }
    }
}