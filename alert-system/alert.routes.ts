import { Router } from 'express';
import { AlertController } from './alert.controller';
import { HealthCheck } from './health-check';
import rateLimit from 'express-rate-limit';
import { validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import helmet from 'helmet';
import cors from 'cors';
import { logAudit } from './audit.logger';
import xss from 'xss-clean';
import bodyParser from 'body-parser';
import { ValidationError } from './error.types';

const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);
const router = Router();

// CORS configuration
const allowedOrigins = ['http://your-allowed-origin.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware to set secure HTTP headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
router.use(limiter);

// XSS protection
router.use(xss());

// Body parser with size limit
router.use(bodyParser.json({ limit: '1mb' }));

// Health check routes
router.get('/health', HealthCheck.checkHealth);
router.get('/ready', HealthCheck.checkReady);

// Alert routes
router.get('/api/alerts', async (req, res) => {
    const start = Date.now();
    try {
        const alerts = await alertController.getActiveAlerts(req, res);
        return res.json(alerts);
    } catch (error) {
        console.error('Failed to get alerts:', error);
        return res.status(500).json({ message: 'Failed to fetch alerts' });
    } finally {
        logAudit('GET /api/alerts', { duration: Date.now() - start });
    }
});

router.post('/api/alerts', async (req, res) => {
    const start = Date.now();
    try {
        const alert = validateAlertMessage(req.body);
        const createdAlert = await alertController.addAlert(req, res);
        logAudit('POST /api/alerts', { alertId: createdAlert.id });
        return res.status(201).json(createdAlert);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }
        return res.status(500).json({ message: 'Failed to create alert.' });
    } finally {
        logAudit('POST /api/alerts', { duration: Date.now() - start });
    }
});

router.put('/api/alerts/:id', async (req, res) => {
    const start = Date.now();
    try {
        const updatedAlert = await alertController.updateAlert(req, res);
        logAudit('PUT /api/alerts/:id', { alertId: req.params.id });
        return res.json(updatedAlert);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    } finally {
        logAudit('PUT /api/alerts/:id', { duration: Date.now() - start });
    }
});

router.delete('/api/alerts/:id', async (req, res) => {
    const start = Date.now();
    try {
        await alertController.deleteAlert(req, res);
        logAudit('DELETE /api/alerts/:id', { alertId: req.params.id });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ message: error.message });
    } finally {
        logAudit('DELETE /api/alerts/:id', { duration: Date.now() - start });
    }
});

export default router;