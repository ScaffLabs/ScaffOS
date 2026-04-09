import { Router } from 'express';
import { AlertController } from './alert.controller';
import { HealthCheck } from './health-check';
import { validateCreateAlertRequest } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError } from './error.types';

const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);
const router = Router();

// Health check route
router.get('/health', (req, res) => alertController.healthCheck(req, res));

// Alert routes
router.get('/api/alerts', async (req, res) => await alertController.getActiveAlerts(req, res));
router.post('/api/alerts', async (req, res) => {
    try {
        const alert = validateCreateAlertRequest(req.body);
        const createdAlert = await alertController.addAlert(req, res);
        return res.status(201).json(createdAlert);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }
        return res.status(500).json({ message: 'Failed to create alert.' });
    }
});

router.put('/api/alerts/:id', async (req, res) => await alertController.updateAlert(req, res));
router.delete('/api/alerts/:id', async (req, res) => await alertController.deleteAlert(req, res));

export default router;