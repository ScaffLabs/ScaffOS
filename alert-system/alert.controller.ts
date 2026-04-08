import express, { Request, Response } from 'express';
import { AlertMessage, validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError, ServiceError, NotFoundError, DivisionByZeroError } from './error.types';
import logger, { logRequest, logError } from './logger';

export class AlertController {
    private alertStore: AlertStore;

    constructor(alertStore: AlertStore) {
        this.alertStore = alertStore;
    }

    async getActiveAlerts(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alerts = await this.alertStore.findIndex({});
            if (!alerts.length) return res.status(204).send();
            return res.json(alerts);
        } catch (error) {
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to fetch active alerts.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    async addAlert(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alert = validateAlertMessage(req.body);
            const createdAlert = await this.alertStore.create(alert);
            return res.status(201).json(createdAlert);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
            } else if (error instanceof DivisionByZeroError) {
                return res.status(400).json({ message: 'Cannot divide by zero.' });
            }
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to add alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    async updateAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        const start = Date.now();
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
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to update alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    async deleteAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        const start = Date.now();
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
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to delete alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }
}