import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';
import { AlertStoreInterface } from './storage';

export class AlertController {
    constructor(private alertStore: AlertStoreInterface) {}

    async addAlert(req: Request, res: Response): Promise<void> {
        const start = Date.now();
        try {
            // Validate incoming request data to ensure it meets the schema requirements.
            const validatedData = validateCreateAlertRequest(req.body);
            // Create a new alert in the data store and return it in the response.
            const createdAlert: AlertMessage = await this.alertStore.create(validatedData);
            res.status(201).json(createdAlert);
            logger.logRequest(req, res, start);
        } catch (error) {
            // Handle any errors that occur during the process and log them appropriately.
            this.handleError(error, res);
            logger.logError(error, { method: req.method, path: req.path });
        }
    }

    async updateAlert(req: Request, res: Response): Promise<void> {
        const start = Date.now();
        const alertId = req.params.id as string;
        try {
            // Update an existing alert identified by its ID and return the updated alert.
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            res.status(200).json(updatedAlert);
            logger.logRequest(req, res, start);
        } catch (error) {
            this.handleError(error, res);
            logger.logError(error, { method: req.method, path: req.path });
        }
    }

    async deleteAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id as string;
        const start = Date.now();
        try {
            // Attempt to delete the alert and send a no content response if successful.
            const success = await this.alertStore.delete(alertId);
            if (!success) throw new NotFoundError('Alert not found.');
            res.status(204).send();
            logger.logRequest(req, res, start);
        } catch (error) {
            this.handleError(error, res);
            logger.logError(error, { method: req.method, path: req.path });
        }
    }

    private handleError(error: Error, res: Response): void {
        // Centralized error handling to send appropriate HTTP responses based on error type.
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