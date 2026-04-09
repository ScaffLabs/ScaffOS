import { Router } from 'express';
import { AlertController } from './alert.controller';
import { validateCreateAlertRequest } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError } from './error.types';
import { sanitize } from './sanitization';
import rateLimit from 'express-rate-limit';
import { HealthCheck } from './health-check';

const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);
const router = Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
        return res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
});

// Apply rate limiting to all alert routes
router.use(limiter);

// Health check routes
router.get('/health', HealthCheck.checkHealth);
router.get('/ready', HealthCheck.checkReady);

// Alert routes
router.get('/api/alerts', async (req, res) => {
    req.query = sanitize(req.query);
    const { limit = 10, offset = 0, type, sort } = req.query;
    try {
        const alerts = await alertController.getActiveAlerts({ query: { limit, offset, type, sort } }, res);
        return res.status(200).json(alerts);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve alerts.' });
    }
});

router.post('/api/alerts', async (req, res) => {
    req.body = sanitize(req.body);
    try {
        const alert = validateCreateAlertRequest(req.body);
        const createdAlert = await alertController.addAlert({ body: alert }, res);
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
    await alertController.updateAlert(req, res);
});

router.delete('/api/alerts/:id', async (req, res) => await alertController.deleteAlert(req, res));

export default router;