import { AlertController } from '../alert.controller';
import { AlertMessage, validateAlertMessage } from '../alert.schema';
import { AlertStore } from '../storage';
import { ServiceError, ValidationError } from '../error.types';

describe('AlertController', () => {
    let alertController: AlertController;
    let alertStore: AlertStore;

    beforeEach(() => {
        alertStore = new AlertStore();
        alertController = new AlertController(alertStore);
    });

    test('should return 204 if no active alerts', async () => {
        const req = {} as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.getActiveAlerts(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(res.json).not.toHaveBeenCalled();
    });

    test('should add an alert and return it', async () => {
        const alert: AlertMessage = { id: '1', type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        const req = { body: alert } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.addAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(alert);
    });

    test('should return 400 for invalid alert data', async () => {
        const req = { body: { type: 'invalid', threshold: -10, currentValue: -1 } } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.addAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Invalid alert data') });
    });

    test('should update an alert and return it', async () => {
        const alert: AlertMessage = { id: '1', type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        await alertStore.create(alert);

        const req = { params: { id: '1' }, body: { threshold: 150 } } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.updateAlert(req, res);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ threshold: 150 }));
    });

    test('should return 404 for updating non-existent alert', async () => {
        const req = { params: { id: 'nonexistent' }, body: { threshold: 150 } } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.updateAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Alert not found.' });
    });

    test('should delete an alert', async () => {
        const alert: AlertMessage = { id: '1', type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        await alertStore.create(alert);

        const req = { params: { id: '1' } } as any;
        const res = { status: jest.fn().mockReturnThis() };

        await alertController.deleteAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(204);
    });

    test('should return 404 for deleting non-existent alert', async () => {
        const req = { params: { id: 'nonexistent' } } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.deleteAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Alert not found.' });
    });

    test('should handle service errors gracefully', async () => {
        jest.spyOn(alertStore, 'create').mockImplementation(() => { throw new ServiceError('Service error'); });
        const req = { body: { type: 'price', threshold: 100, currentValue: 120 } } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.addAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Failed to add alert.' });
    });

    test('should return 400 for empty alert data', async () => {
        const req = { body: {} } as any;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

        await alertController.addAlert(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: expect.stringContaining('Invalid alert data') });
    });
});
