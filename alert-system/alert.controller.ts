import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { AlertStore } from './storage';
import { EventBus } from './event-bus';
import { ValidationError, ServiceError, NotFoundError } from './error.types';
import logger, { logRequest, logError } from './logger';
import axios from 'axios';

export class AlertController {
    private alertStore: AlertStore;
    private eventBus: EventBus;

    constructor(alertStore: AlertStore, eventBus: EventBus) {
        this.alertStore = alertStore;
        this.eventBus = eventBus;
    }

    async getActiveAlerts(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alerts = await this.alertStore.findIndex({});
            if (!alerts || alerts.length === 0) return res.status(204).send();
            return res.json(alerts);
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
            this.eventBus.publish('alert.created', createdAlert);
            await this.notifyServices(createdAlert);
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

    private async notifyServices(alert: AlertMessage) {
        try {
            const webhookUrl = process.env.WEBHOOK_URL;
            await axios.post(webhookUrl, alert);
        } catch (error) {
            console.error('Failed to notify services:', error);
            throw new ServiceError('Failed to notify services.');
        }
    }

    async updateAlert(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alertId = req.params.id;
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            this.eventBus.publish('alert.updated', updatedAlert);
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
        const start = Date.now();
        try {
            const alertId = req.params.id;
            const deleted = await this.alertStore.delete(alertId);
            if (!deleted) throw new NotFoundError('Alert not found.');
            this.eventBus.publish('alert.deleted', alertId);
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