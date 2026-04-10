import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { AlertStoreInterface } from './storage';
import { EventBus } from './event-bus';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger, { logRequest } from './logger';
import axios from 'axios';
import { CircuitBreaker } from 'opossum';

const options = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 10000
};

const webhookCircuit = new CircuitBreaker(async (alert) => {
    return await axios.post(process.env.WEBHOOK_URL, alert);
}, options);

const emailServiceCircuit = new CircuitBreaker(async (alert) => {
    return await axios.post(process.env.EMAIL_SERVICE_URL, alert);
}, options);

export class AlertController {
    private alertStore: AlertStoreInterface;
    private eventBus: EventBus;

    constructor(alertStore: AlertStoreInterface, eventBus: EventBus) {
        this.alertStore = alertStore;
        this.eventBus = eventBus;
    }

    async getActiveAlerts(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alerts = await this.alertStore.findIndex({});
            if (!alerts.length) {
                return res.status(204).send();
            }
            return res.status(200).json(alerts);
        } catch (error) {
            logger.error(error);
            return res.status(500).json({ message: 'Failed to retrieve alerts.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    async addAlert(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alertData = validateCreateAlertRequest(req.body);
            if (alertData.threshold < 0 || alertData.currentValue < 0) {
                throw new ValidationError('Threshold and current value must be non-negative.');
            }
            const createdAlert = await this.alertStore.create(alertData);
            this.eventBus.publish('alert.created', createdAlert);
            await this.notifyExternalServices(createdAlert);
            return res.status(201).json(createdAlert);
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
            }
            logger.error(error);
            return res.status(500).json({ message: 'Failed to add alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    private async notifyExternalServices(alert: AlertMessage) {
        try {
            await Promise.all([
                webhookCircuit.fire(alert),
                emailServiceCircuit.fire(alert)
            ]);
        } catch (error) {
            logger.error(error);
            throw new ServiceError('Failed to notify external services.');
        }
    }

    async updateAlert(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alertId = req.params.id;
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            this.eventBus.publish('alert.updated', updatedAlert);
            return res.status(200).json(updatedAlert);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message });
            }
            logger.error(error);
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
            logger.error(error);
            return res.status(500).json({ message: 'Failed to delete alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }
}