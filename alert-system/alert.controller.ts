import express, { Request, Response } from 'express';
import { AlertMessage, validateAlertMessage, validateCreateAlertRequest } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError, ServiceError, NotFoundError } from './error.types';
import logger, { logRequest, logError } from './logger';

export class AlertController {
    private alertStore: AlertStore;

    constructor(alertStore: AlertStore) {
        this.alertStore = alertStore;
    }

    async getActiveAlerts(req: Request, res: Response, pagination: { limit?: string; offset?: string; type?: string; threshold?: number } = {}) {
        const start = Date.now();
        const { limit, offset, type, threshold } = pagination;
        try {
            const query = {};
            if (type) query.type = type;
            if (threshold !== undefined) query.threshold = { $gte: threshold };

            const alerts = await this.alertStore.findIndex(query);
            const paginatedAlerts = alerts.slice(Number(offset) || 0, (Number(offset) || 0) + (Number(limit) || alerts.length));
            if (!paginatedAlerts.length) return res.status(204).send();
            return res.json(paginatedAlerts);
        } catch (error) {
            logError(error);
            return res.status(500).json({ message: 'Failed to fetch active alerts.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    async addAlert(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alertData = validateCreateAlertRequest(req.body);
            const createdAlert = await this.alertStore.create(alertData);
            return res.status(201).json(createdAlert);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
            }
            logError(error);
            return res.status(500).json({ message: 'Failed to add alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    async updateAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        const start = Date.now();
        try {
            const alertData = validateAlertMessage(req.body);
            const updatedAlert = await this.alertStore.update(alertId, alertData);
            if (!updatedAlert) {
                throw new NotFoundError('Alert not found.');
            }
            return res.json(updatedAlert);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message });
            }
            logError(error);
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
            logError(error);
            return res.status(500).json({ message: 'Failed to delete alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }
}