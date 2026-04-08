import request from 'supertest';
import express from 'express';
import { AlertController } from '../alert.controller';
import { AlertProcessor } from '../alert.processor';
import { EventBus } from '../../event-bus';

const app = express();
const eventBus = new EventBus();
const alertController = new AlertController();
const alertProcessor = new AlertProcessor(eventBus, alertController);

app.get('/alerts', (req, res) => alertController.getActiveAlerts(req, res));

describe('Alert API Integration Tests', () => {
    test('GET /alerts returns an empty array initially', async () => {
        const response = await request(app).get('/alerts');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    test('GET /alerts after adding an alert', async () => {
        const alertMessage = { id: '1', type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        alertController.addAlert(alertMessage);

        const response = await request(app).get('/alerts');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([alertMessage]);
    });
});
