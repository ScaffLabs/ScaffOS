import { AlertController } from '../alert.controller';
import { AlertStore } from '../storage';
import { AlertMessage } from '../alert.schema';
import { ServiceError, ValidationError, NotFoundError } from '../error.types';

const mockAlertStore = new AlertStore();
const alertController = new AlertController(mockAlertStore);

describe('AlertController', () => {
    let alert: AlertMessage;

    beforeEach(() => {
        alert = { id: '1', type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
    });

    test('should create an alert successfully', async () => {
        const req = { body: { type: 'price', threshold: 100, currentValue: 120 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.addAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ type: 'price' }));
    });

    test('should return 400 for invalid data', async () => {
        const req = { body: { type: 'price', threshold: -50, currentValue: 120 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.addAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Invalid alert data') });
    });

    test('should return 204 if no active alerts', async () => {
        const req = {} as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.getActiveAlerts(req, res);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).not.toHaveBeenCalled();
    });

    test('should update an alert successfully', async () => {
        await mockAlertStore.create(alert);
        const req = { params: { id: '1' }, body: { threshold: 150 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.updateAlert(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ threshold: 150 }));
    });

    test('should return 404 when updating non-existent alert', async () => {
        const req = { params: { id: 'nonexistent' }, body: { threshold: 150 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.updateAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Alert not found.' });
    });

    test('should delete an alert successfully', async () => {
        await mockAlertStore.create(alert);
        const req = { params: { id: '1' } };
        const res = { status: jest.fn().mockReturnThis() };
        await alertController.deleteAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(204);
    });

    test('should return 404 when deleting non-existent alert', async () => {
        const req = { params: { id: 'nonexistent' } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.deleteAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Alert not found.' });
    });

    test('should handle service errors gracefully', async () => {
        jest.spyOn(mockAlertStore, 'create').mockImplementation(() => { throw new ServiceError('Service error'); });
        const req = { body: { type: 'price', threshold: 100, currentValue: 120 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.addAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to add alert.' });
    });

    test('should handle unexpected errors gracefully', async () => {
        jest.spyOn(mockAlertStore, 'create').mockImplementation(() => { throw new Error('Unexpected error'); });
        const req = { body: { type: 'price', threshold: 100, currentValue: 120 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.addAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to add alert.' });
    });

    test('should handle rate limiting gracefully', async () => {
        jest.spyOn(mockAlertStore, 'create').mockImplementation(() => { throw new Error('Rate limit exceeded'); });
        const req = { body: { type: 'price', threshold: 100, currentValue: 120 } };
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
        await alertController.addAlert(req, res);
        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({ message: 'Too many requests, please try again later.' });
    });
});