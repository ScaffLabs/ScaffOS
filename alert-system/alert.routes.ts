import { Router } from 'express';
import { AlertController } from './alert.controller';
import rateLimit from 'express-rate-limit';
import { validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import helmet from 'helmet';
import cors from 'cors';
import { logAudit } from './audit.logger';

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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});

router.use(limiter);

router.get('/api/alerts', async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const alerts = await alertStore.findIndex({}).skip(offset).limit(limit);
        if (!alerts.length) return res.status(204).send();
        return res.json(alerts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to fetch alerts.' });
    }
});

router.post('/api/alerts', async (req, res) => {
    try {
        const alert = validateAlertMessage(req.body);
        const createdAlert = await alertStore.create(alert);
        logAudit('CREATE_ALERT', createdAlert);
        return res.status(201).json(createdAlert);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
        }
        console.error(error);
        return res.status(500).json({ message: 'Failed to create alert.' });
    }
});

router.put('/api/alerts/:id', async (req, res) => {
    const alertId = req.params.id;
    try {
        const updatedAlert = await alertStore.update(alertId, req.body);
        if (!updatedAlert) {
            return res.status(404).json({ message: 'Alert not found.' });
        }
        logAudit('UPDATE_ALERT', { id: alertId, update: req.body });
        return res.json(updatedAlert);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update alert.' });
    }
});

router.delete('/api/alerts/:id', async (req, res) => {
    const alertId = req.params.id;
    try {
        const deleted = await alertStore.delete(alertId);
        if (!deleted) {
            return res.status(404).json({ message: 'Alert not found.' });
        }
        logAudit('DELETE_ALERT', { id: alertId });
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete alert.' });
    }
});

export default router;