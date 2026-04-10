import { Router } from 'express';
import { AlertController } from './alert.controller';
import { ValidationError } from './error.types';
import { sanitize } from './sanitization';

const alertController = new AlertController();
const router = Router();

router.post('/api/alerts', async (req, res) => {
    req.body = sanitize(req.body);
    try {
        const createdAlert = await alertController.addAlert(req.body);
        return res.status(201).json(createdAlert);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }
        return res.status(500).json({ message: 'Failed to create alert.' });
    }
});

router.put('/api/alerts/:id', async (req, res) => {
    req.body = sanitize(req.body);
    const alertId = req.params.id;
    try {
        const updatedAlert = await alertController.updateAlert(alertId, req.body);
        return res.status(200).json(updatedAlert);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'Alert not found.' });
        }
        return res.status(500).json({ message: 'Failed to update alert.' });
    }
});

router.delete('/api/alerts/:id', async (req, res) => {
    const alertId = req.params.id;
    try {
        await alertController.deleteAlert(alertId);
        return res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: 'Alert not found.' });
        }
        return res.status(500).json({ message: 'Failed to delete alert.' });
    }
});

export default router;