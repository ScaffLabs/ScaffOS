import express, { Request, Response } from 'express';
import { AlertMessage, validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError, ServiceError, NotFoundError } from './error.types';

export class AlertController {
    private alertStore: AlertStore;

    constructor(alertStore: AlertStore) {
        this.alertStore = alertStore;
    }

    async getActiveAlerts(req: Request, res: Response) {
        try {
            // Fetch all alerts from the store
            const alerts = await this.alertStore.findIndex({});
            // If no alerts found, respond with 204 No Content
            if (!alerts || alerts.length === 0) {
                return res.status(204).send();
            }
            // Respond with the list of active alerts
            return res.json(alerts);
        } catch (error) {
            console.error(error);
            // In case of error, throw a service error
            throw new ServiceError('Failed to fetch active alerts.');
        }
    }

    async addAlert(req: Request, res: Response) {
        try {
            // Validate the incoming alert data
            const alert = validateAlertMessage(req.body);
            // Create the alert in the store
            const createdAlert = await this.alertStore.create(alert);
            // Respond with the created alert
            return res.status(201).json(createdAlert);
        } catch (error) {
            if (error instanceof ValidationError) {
                // If validation fails, respond with 400 Bad Request
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
            }
            console.error(error);
            // Handle unexpected errors
            throw new ServiceError('Failed to add alert.');
        }
    }

    async updateAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        try {
            // Update the alert by ID
            const updatedAlert = await this.alertStore.update(alertId, req.body);
            if (!updatedAlert) {
                // If alert not found, throw a NotFoundError
                throw new NotFoundError('Alert not found.');
            }
            // Respond with the updated alert
            return res.json(updatedAlert);
        } catch (error) {
            if (error instanceof NotFoundError) {
                // If not found, respond with 404 Not Found
                return res.status(404).json({ message: error.message });
            }
            console.error(error);
            // Handle unexpected errors
            throw new ServiceError('Failed to update alert.');
        }
    }

    async deleteAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        try {
            // Delete alert by ID
            const deleted = await this.alertStore.delete(alertId);
            if (!deleted) {
                // If alert not found, throw a NotFoundError
                throw new NotFoundError('Alert not found.');
            }
            // Respond with 204 No Content
            return res.status(204).send();
        } catch (error) {
            if (error instanceof NotFoundError) {
                // If not found, respond with 404 Not Found
                return res.status(404).json({ message: error.message });
            }
            console.error(error);
            // Handle unexpected errors
            throw new ServiceError('Failed to delete alert.');
        }
    }
}