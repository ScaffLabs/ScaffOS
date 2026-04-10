import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';

export class AlertController {
    constructor(private alertStore: AlertStoreInterface) {}

    async addAlert(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = validateCreateAlertRequest(req.body);
            const createdAlert = await this.alertStore.create(validatedData);
            res.status(201).json(createdAlert);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async updateAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id;
        try {
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            res.status(200).json(updatedAlert);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    async deleteAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id;
        try {
            const success = await this.alertStore.delete(alertId);
            if (!success) throw new NotFoundError('Alert not found.');
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
        } else if (error instanceof ServiceError) {
            logger.error({ message: 'Service Error: ' + error.message });
            res.status(500).json({ message: 'Service Error: An unexpected error occurred.' });
        } else {
            logger.error({ message: 'An unexpected error occurred: ' + error.message });
            res.status(500).json({ message: 'An unexpected error occurred.' });
        }
    }
} 