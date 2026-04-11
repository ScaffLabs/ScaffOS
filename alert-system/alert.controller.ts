import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';
import { AlertStoreInterface } from './storage';
import { EventBus } from './event-bus';
import { AlertProcessor } from './alert.processor';

export class AlertController {
    constructor(private alertStore: AlertStoreInterface, private eventBus: EventBus, private alertProcessor: AlertProcessor) {}

    async addAlert(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = validateCreateAlertRequest(req.body);
            const createdAlert: AlertMessage = await this.alertStore.create(validatedData);
            this.eventBus.publish('alert.created', createdAlert);
            await this.alertProcessor.processAlert(createdAlert);
            res.status(201).json(createdAlert);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async updateAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id as string;
        try {
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            this.eventBus.publish('alert.updated', updatedAlert);
            await this.alertProcessor.processAlert(updatedAlert);
            res.status(200).json(updatedAlert);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async deleteAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id as string;
        try {
            const success = await this.alertStore.delete(alertId);
            if (!success) throw new NotFoundError('Alert not found.');
            this.eventBus.publish('alert.deleted', { id: alertId });
            res.status(204).send();
        } catch (error) {
            this.handleError(error, res);
        }
    }

    private handleError(error: Error, res: Response): void {
        if (error instanceof ValidationError) {
            res.status(400).json({ message: 'Validation Error: ' + error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ message: 'Not Found: ' + error.message });
        } else {
            logger.error({ message: 'An unexpected error occurred: ' + error.message });
            res.status(500).json({ message: 'An unexpected error occurred.' });
        }
    }

    async getActiveAlerts(pagination: any): Promise<AlertMessage[]> {
        return await this.alertStore.findIndex({}).limit(pagination.limit).skip(pagination.offset);
    }
}