import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { body, param, query, validationResult } from 'express-validator';
import { alertStore } from './index';
import { AlertMessage } from './alert.schema';
import { ValidationError, NotFoundError } from './error.types';

const router = express.Router();

// CORS configuration
const allowedOrigins = ['http://example.com', 'http://another-domain.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware for security headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

// Request size limit
router.use(express.json({ limit: '1mb' }));

// Create alert
router.post('/alerts', limiter, body('type').isString().notEmpty().escape(), body('threshold').isNumeric(), body('currentValue').isNumeric(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const alert: AlertMessage = { ...req.body, id: Date.now().toString(), createdAt: new Date() };
    const createdAlert = await alertStore.create(alert);
    return res.status(201).json(createdAlert);
});

// Get alert by ID
router.get('/alerts/:id', param('id').isString(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const alert = await alertStore.read(req.params.id);
    if (!alert) {
        return res.status(404).json({ message: 'Alert not found.' });
    }
    return res.status(200).json(alert);
});

// Update alert
router.put('/alerts/:id', limiter, param('id').isString(), body('threshold').isNumeric(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const updatedAlert = await alertStore.update(req.params.id, req.body);
    if (!updatedAlert) {
        return res.status(404).json({ message: 'Alert not found.' });
    }
    return res.status(200).json(updatedAlert);
});

// Delete alert
router.delete('/alerts/:id', param('id').isString(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const deleted = await alertStore.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ message: 'Alert not found.' });
    }
    return res.status(204).send();
});

// List alerts with pagination, filtering, and sorting
router.get('/alerts', query('limit').isNumeric().optional(), query('offset').isNumeric().optional(), query('sort').isString().optional(), async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const sort = req.query.sort ? req.query.sort.split(',') : [];

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
});

export default router;