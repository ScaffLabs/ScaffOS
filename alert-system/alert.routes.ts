import express, { Request, Response } from 'express';
import { alertStore } from './index';
import { AlertMessage } from './alert.schema';
import { ValidationError, NotFoundError } from './error.types';
import rateLimit from 'express-rate-limit';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

// Create alert
router.post('/alerts', limiter, body('type').isString().notEmpty(), body('threshold').isNumeric(), body('currentValue').isNumeric(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError('Invalid input.');
    }
    const alert: AlertMessage = req.body;
    const createdAlert = await alertStore.create(alert);
    return res.status(201).json(createdAlert);
});

// Get alert by ID
router.get('/alerts/:id', param('id').isString(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError('Invalid alert ID.');
    }
    const alert = await alertStore.read(req.params.id);
    if (!alert) {
        throw new NotFoundError('Alert not found.');
    }
    return res.status(200).json(alert);
});

// Update alert
router.put('/alerts/:id', limiter, param('id').isString(), body('threshold').isNumeric(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError('Invalid input.');
    }
    const updatedAlert = await alertStore.update(req.params.id, req.body);
    if (!updatedAlert) {
        throw new NotFoundError('Alert not found.');
    }
    return res.status(200).json(updatedAlert);
});

// Delete alert
router.delete('/alerts/:id', param('id').isString(), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ValidationError('Invalid alert ID.');
    }
    const deleted = await alertStore.delete(req.params.id);
    if (!deleted) {
        throw new NotFoundError('Alert not found.');
    }
    return res.status(204).send();
});

// List alerts with pagination, filtering, and sorting
router.get('/alerts', query('limit').isNumeric().optional(), query('offset').isNumeric().optional(), query('sort').isString().optional(), async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const sort = req.query.sort ? req.query.sort.split(',') : [];
    const alerts = await alertStore.findIndex({}); // Implement filtering if needed
    const sortedAlerts = alerts.sort((a, b) => {
        // Sort logic based on `sort` query
        return 0; // Placeholder for actual sorting
    }).slice(offset, offset + limit);
    return res.status(200).json(sortedAlerts);
});

export default router;