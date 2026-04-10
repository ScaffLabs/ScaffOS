import express, { Request, Response } from 'express';
import { AlertMessage, validateCreateAlertRequest } from './alert.schema';
import { ServiceError, ValidationError, NotFoundError } from './error.types';
import logger from './logger';

export class AlertController {
    async addAlert(alertData: any): Promise<AlertMessage> {
        try {
            const validatedData = validateCreateAlertRequest(alertData);
            const createdAlert = await this.alertStore.create(validatedData);
            return createdAlert;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw new ValidationError('Invalid alert data: ' + error.message);
            }
            throw new ServiceError('Failed to create alert.');
        }
    }

    async updateAlert(id: string, alertData: any): Promise<AlertMessage> {
        try {
            const updatedAlert = await this.alertStore.update(id, alertData);
            if (!updatedAlert) throw new NotFoundError('Alert not found.');
            return updatedAlert;
        } catch (error) {
            throw new ServiceError('Failed to update alert.');
        }
    }

    async deleteAlert(id: string): Promise<void> {
        try {
            const success = await this.alertStore.delete(id);
            if (!success) throw new NotFoundError('Alert not found.');
        } catch (error) {
            throw new ServiceError('Failed to delete alert.');
        }
    }
}