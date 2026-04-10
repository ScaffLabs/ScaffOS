import request from 'supertest';
import express from 'express';
import { AlertController } from '../alert.controller';
import { AlertStore } from '../storage';
import { EventBus } from '../event-bus';

const app = express();
const eventBus = new EventBus();
const alertStore = new AlertStore();
const alertController = new AlertController(alertStore, eventBus);

app.use(express.json());
app.post('/api/alerts', (req, res) => alertController.addAlert(req, res));
app.get('/api/alerts', (req, res) => alertController.getActiveAlerts(req, res));
app.put('/api/alerts/:id', (req, res) => alertController.updateAlert(req, res));
app.delete('/api/alerts/:id', (req, res) => alertController.deleteAlert(req, res));

describe('Alert API Integration Tests', () => {
    afterEach(async () => {
        await alertStore.deleteAll(); // Clear all alerts after each test
    });

    test('POST /api/alerts creates a new alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120 };
        const response = await request(app).post('/api/alerts').send(alertMessage);
        expect(response.status).toBe(201);
        expect(response.body).toMatchObject(alertMessage);
    });

    test('GET /api/alerts returns created alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120 };
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

    test('PUT /api/alerts/:id updates an alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120 };
        const createdResponse = await request(app).post('/api/alerts').send(alertMessage);
        const alertId = createdResponse.body.id;
        const updateResponse = await request(app).put(`/api/alerts/${alertId}`).send({ threshold: 150 });
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.threshold).toBe(150);
    });

    test('DELETE /api/alerts/:id deletes an alert', async () => {
        const alertMessage = { type: 'price', threshold: 100, currentValue: 120 };
        const createdResponse = await request(app).post('/api/alerts').send(alertMessage);
        const alertId = createdResponse.body.id;
        const deleteResponse = await request(app).delete(`/api/alerts/${alertId}`);
        expect(deleteResponse.status).toBe(204);
    });

    test('should handle unexpected errors gracefully', async () => {
        jest.spyOn(alertStore, 'create').mockImplementation(() => { throw new Error('Unexpected error'); });
        const req = { body: { type: 'price', threshold: 100, currentValue: 120 } };
        const response = await request(app).post('/api/alerts').send(req.body);
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to create alert.' });
    });
});