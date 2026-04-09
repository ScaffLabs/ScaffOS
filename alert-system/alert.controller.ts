import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { AlertStore } from './storage';
import { EventBus } from './event-bus';
import { ValidationError, ServiceError, NotFoundError } from './error.types';
import logger, { logRequest, logError } from './logger';

export class AlertController {
    private alertStore: AlertStore;
    private eventBus: EventBus;

    constructor(alertStore: AlertStore, eventBus: EventBus) {
        this.alertStore = alertStore;
        this.eventBus = eventBus;
    }

    async getActiveAlerts(req: Request, res: Response) {
        const start = Date.now();
        const { limit = 10, offset = 0, type, sort } = req.query;
        try {
            const filters: any = {};
            if (type) filters.type = type;
            const alerts = await this.alertStore.findIndex(filters);
            const sortedAlerts = sort ? alerts.sort((a, b) => a[sort] > b[sort] ? 1 : -1) : alerts;
            const paginatedAlerts = sortedAlerts.slice(Number(offset), Number(offset) + Number(limit));
            return res.status(200).json(paginatedAlerts);
        } catch (error) {
            logError(error);
            return res.status(500).json({ message: 'Failed to retrieve alerts.' });
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
            const success = await this.alertStore.delete(alertId);
            if (!success) throw new NotFoundError('Alert not found.');
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