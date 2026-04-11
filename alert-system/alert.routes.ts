import { Router } from 'express';
import { AlertController } from './alert.controller';
import { validateCreateAlertRequest, validatePaginationRequest } from './alert.schema';
import { ValidationError, NotFoundError } from './error.types';
import rateLimit from 'express-rate-limit';
import { sanitize } from './sanitization';
import { HealthCheck } from './health-check';

const alertController = new AlertController();
const router = Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

router.use(limiter);

router.get('/health', HealthCheck.checkHealth);
router.get('/ready', HealthCheck.checkReady);
router.get('/memory', HealthCheck.checkMemoryUsage);

router.get('/api/alerts', async (req, res) => {
    const pagination = validatePaginationRequest(req.query);
    try {
        const alerts = await alertController.getActiveAlerts(pagination);
        if (alerts.length === 0) {
            return res.status(204).send();
        }
        return res.status(200).json(alerts);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve alerts.' });
    }
});

router.post('/api/alerts', async (req, res) => {
    req.body = sanitize(req.body);
    try {
        const validatedData = validateCreateAlertRequest(req.body);
        const createdAlert = await alertController.addAlert(validatedData);
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