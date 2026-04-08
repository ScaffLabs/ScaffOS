import request from 'supertest';
import express from 'express';
import { AlertController } from '../alert.controller';
import { AlertStore } from '../storage';
import { EventBus } from '../event-bus';

const app = express();
const eventBus = new EventBus();
const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);

app.use(express.json());
app.post('/api/alerts', (req, res) => alertController.addAlert(req, res));
app.get('/api/alerts', (req, res) => alertController.getActiveAlerts(req, res));
app.put('/api/alerts/:id', (req, res) => alertController.updateAlert(req, res));
app.delete('/api/alerts/:id', (req, res) => alertController.deleteAlert(req, res));

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

    test('POST /api/alerts returns 400 for invalid alert data', async () => {
        const alertMessage = { type: 'invalid', threshold: -10, currentValue: -1 };
        const response = await request(app).post('/api/alerts').send(alertMessage);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: expect.stringContaining('Invalid alert data') });
    });

    test('GET /api/alerts returns 404 for non-existent alert', async () => {
        const response = await request(app).get('/api/alerts/nonexistent');
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Alert not found.' });
    });

    test('PUT /api/alerts/:id updates an alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        const createdResponse = await request(app).post('/api/alerts').send(alertMessage);
        const alertId = createdResponse.body.id;
        const updateResponse = await request(app).put(`/api/alerts/${alertId}`).send({ threshold: 150 });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.threshold).toBe(150);
    });

    test('DELETE /api/alerts/:id deletes an alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        const createdResponse = await request(app).post('/api/alerts').send(alertMessage);
        const alertId = createdResponse.body.id;
        const deleteResponse = await request(app).delete(`/api/alerts/${alertId}`);
        expect(deleteResponse.status).toBe(204);
    });
});
