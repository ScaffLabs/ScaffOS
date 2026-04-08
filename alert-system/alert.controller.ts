import express, { Request, Response } from 'express';
import { AlertMessage, validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError, ServiceError, NotFoundError } from './error.types';
import logger, { logRequest, logError } from './logger';

export class AlertController {
    private alertStore: AlertStore;

    constructor(alertStore: AlertStore) {
        this.alertStore = alertStore;
    }

    async getActiveAlerts(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alerts = await this.alertStore.findIndex({}); // Fetch all active alerts
            if (!alerts.length) return res.status(204).send(); // Return 204 if no alerts are found
            return res.json(alerts); // Return the fetched alerts
        } catch (error) {
            logError(error, { method: req.method, path: req.path }); // Log errors for monitoring
            return res.status(500).json({ message: 'Failed to fetch active alerts.' }); // Handle error response
        } finally {
            logRequest(req, res, start); // Log request duration and details
        }
    }

    async addAlert(req: Request, res: Response) {
        const start = Date.now();
        try {
            const alert = validateAlertMessage(req.body); // Validate incoming alert data
            const createdAlert = await this.alertStore.create(alert); // Create alert in data store
            return res.status(201).json(createdAlert); // Return created alert
        } catch (error) {
            if (error instanceof ValidationError) {
                return res.status(400).json({ message: 'Invalid alert data: ' + error.message }); // Handle validation errors
            }
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to add alert.' }); // Handle error response
        } finally {
            logRequest(req, res, start); // Log request duration and details
        }
    }

    async updateAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        const start = Date.now();
        try {
            const updatedAlert = await this.alertStore.update(alertId, req.body); // Update alert in data store
            if (!updatedAlert) {
                throw new NotFoundError('Alert not found.'); // Throw error if alert doesn't exist
            }
            return res.json(updatedAlert); // Return updated alert
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message }); // Handle not found error
            }
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to update alert.' }); // Handle error response
        } finally {
            logRequest(req, res, start); // Log request duration and details
        }
    }

    async deleteAlert(req: Request, res: Response) {
        const alertId = req.params.id;
        const start = Date.now();
        try {
            const deleted = await this.alertStore.delete(alertId); // Delete alert from data store
            if (!deleted) {
                throw new NotFoundError('Alert not found.'); // Throw error if alert doesn't exist
            }
            return res.status(204).send(); // Return 204 for successful deletion
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ message: error.message }); // Handle not found error
            }
            logError(error, { method: req.method, path: req.path });
            return res.status(500).json({ message: 'Failed to delete alert.' }); // Handle error response
        } finally {
            logRequest(req, res, start); // Log request duration and details
        }
    }
}