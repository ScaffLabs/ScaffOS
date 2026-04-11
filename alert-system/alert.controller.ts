import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';
import { AlertStoreInterface } from './storage';

export class AlertController {
    constructor(private alertStore: AlertStoreInterface) {}

    /**
     * Adds a new alert.
     * @param req - The request object containing alert data.
     * @param res - The response object to send the result.
     */
    async addAlert(req: Request, res: Response): Promise<void> {
        try {
            const validatedData = validateCreateAlertRequest(req.body);
            const createdAlert: AlertMessage = await this.alertStore.create(validatedData);
            res.status(201).json(createdAlert);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Updates an existing alert.
     * @param req - The request object containing alert id and update data.
     * @param res - The response object to send the result.
     */
    async updateAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id as OrderId;
        try {
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            res.status(200).json(updatedAlert);
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Deletes an alert.
     * @param req - The request object containing alert id.
     * @param res - The response object to send the result.
     */
    async deleteAlert(req: Request, res: Response): Promise<void> {
        const alertId = req.params.id as OrderId;
        try {
            const success = await this.alertStore.delete(alertId);
            if (!success) throw new NotFoundError('Alert not found.');
            res.status(204).send();
        } catch (error) {
            this.handleError(error, res);
        }
    }

    /**
     * Handles errors and sends appropriate responses.
     * @param error - The error to handle.
     * @param res - The response object to send the error.
     */
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