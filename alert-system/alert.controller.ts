import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { AlertStoreInterface } from './storage';
import { EventBus } from './event-bus';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger, { logRequest, logError } from './logger';
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
            logError(error, { requestId: req.headers['x-request-id'] });
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
            }
            logger.error('Failed to add alert.', { error: error.message });
            return res.status(500).json({ message: 'Failed to add alert.' });
        } finally {
            logRequest(req, res, start);
        }
    }

    private async notifyExternalServices(alert: AlertMessage) {
        try {
            await Promise.all([
                webhookCircuit.fire(alert).catch(err => {
                    logger.error(err);
                    throw new ServiceError('Webhook notification failed.');
                }),
                emailServiceCircuit.fire(alert).catch(err => {
                    logger.error(err);
                    throw new ServiceError('Email notification failed.');
                })
            ]);
        } catch (error) {
            logger.error(error);
            throw new ServiceError('Failed to notify external services.');
        }
    }

    async checkHealth(req: Request, res: Response) {
        const services = ['WEBHOOK', 'EMAIL'];
        const health = await this.checkExternalServices(services);
        return res.json({ services: health });
    }

    private async checkExternalServices(services: string[]): Promise<{ [key: string]: boolean }> {
        const results: { [key: string]: boolean } = {};
        await Promise.all(services.map(async (service) => {
            try {
                const res = await axios.get(`${process.env[service + '_URL']}/health`);
                results[service] = res.status === 200;
            } catch (error) {
                logger.error(`Health check for ${service} failed: ${error.message}`);
                results[service] = false;
            }
        }));
        return results;
    }
}