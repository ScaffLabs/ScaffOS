import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { body, param, query, validationResult } from 'express-validator';
import { AlertStore } from './storage';
import { AlertMessage } from './alert.schema';
import { ValidationError, NotFoundError } from './error.types';
import { logError } from './logger';

const router = express.Router();

// CORS configuration
router.use(cors());
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

router.use(express.json({ limit: '1mb' }));

const alertStore = new AlertStore();

// Create alert
router.post('/alerts', limiter, body('type').isString().notEmpty().escape(), body('threshold').isNumeric().not().isEmpty(), body('currentValue').isNumeric().not().isEmpty(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const alert: AlertMessage = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
    try {
        const createdAlert = await alertStore.create(alert);
        return res.status(201).json(createdAlert);
    } catch (error) {
        logError(error, 'Failed to create alert');
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Get alert by ID
router.get('/alerts/:id', param('id').isString(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const alert = await alertStore.read(req.params.id);
        if (!alert) {
            throw new NotFoundError('Alert not found.');
        }
        return res.status(200).json(alert);
    } catch (error) {
        logError(error, 'Failed to get alert');
        return res.status(404).json({ message: error.message });
    }
});

// Update alert
router.put('/alerts/:id', limiter, param('id').isString(), body('threshold').isNumeric().not().isEmpty(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const updatedAlert = await alertStore.update(req.params.id, req.body);
        if (!updatedAlert) {
            throw new NotFoundError('Alert not found.');
        }
        return res.status(200).json(updatedAlert);
    } catch (error) {
        logError(error, 'Failed to update alert');
        return res.status(404).json({ message: error.message });
    }
});

// Delete alert
router.delete('/alerts/:id', param('id').isString(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const deleted = await alertStore.delete(req.params.id);
        if (!deleted) {
            throw new NotFoundError('Alert not found.');
        }
        return res.status(204).send();
    } catch (error) {
        logError(error, 'Failed to delete alert');
        return res.status(404).json({ message: error.message });
    }
});

// List alerts with pagination, filtering, and sorting
router.get('/alerts', query('limit').isNumeric().optional(), query('offset').isNumeric().optional(), query('sort').isString().optional(), async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const sort = req.query.sort ? req.query.sort.split(',') : [];

    try {
        let alerts = await alertStore.findIndex({});

        // Implement sorting
        if (sort.length > 0) {
            alerts.sort((a, b) => {
                for (const field of sort) {
                    if (a[field] < b[field]) return -1;
                    if (a[field] > b[field]) return 1;
                }
                return 0;
            });
        }

        // Implement pagination
        const paginatedAlerts = alerts.slice(offset, offset + limit);
        return res.status(200).json(paginatedAlerts);
    } catch (error) {
        logError(error, 'Failed to list alerts');
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;