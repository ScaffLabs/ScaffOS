import { AlertController } from '../alert.controller';
import { AlertMessage } from '../alert.schema';

describe('AlertController', () => {
    let alertController: AlertController;

    beforeEach(() => {
        alertController = new AlertController();
    });

    test('should return active alerts', () => {
        const req = {} as any;
        const res = { json: jest.fn() };

        alertController.getActiveAlerts(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });

    test('should add an alert to active alerts', () => {
        const alert: AlertMessage = { id: '1', type: 'price', threshold: 100, currentValue: 120, createdAt: new Date() };
        alertController.addAlert(alert);

        const req = {} as any;
        const res = { json: jest.fn() };
        alertController.getActiveAlerts(req, res);

        expect(res.json).toHaveBeenCalledWith([alert]);
    });
});
