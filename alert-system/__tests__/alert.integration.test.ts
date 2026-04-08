import request from 'supertest';
import express from 'express';
import { AlertController } from '../alert.controller';
import { AlertProcessor } from '../alert.processor';
import { EventBus } from '../event-bus';
import { AlertStore } from '../storage';

const app = express();
const eventBus = new EventBus();
const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);

app.use(express.json());
app.post('/api/alerts', (req, res) => alertController.addAlert(req, res));
app.get('/api/alerts', (req, res) => alertController.getActiveAlerts(req, res));

describe('Alert API Integration Tests', () => {
    test('POST /api/alerts creates a new alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        const response = await request(app).post('/api/alerts').send(alertMessage);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(alertMessage);
    });

    test('GET /api/alerts returns created alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        await request(app).post('/api/alerts').send(alertMessage);
        const response = await request(app).get('/api/alerts');
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject(alertMessage);
    });

    test('GET /api/alerts returns 204 if no alerts', async () => {
        const response = await request(app).get('/api/alerts');
        expect(response.status).toBe(204);
    });
});
