import { Router } from 'express';
import { AlertController } from './alert.controller';
import { validateCreateAlertRequest, validatePaginationRequest } from './alert.schema';
import { AlertStore } from './storage';
import { ValidationError } from './error.types';
import { sanitize } from './sanitization';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import { HealthCheck } from './health-check';
import { logAudit } from './audit.logger';

const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);
const router = Router();

// CORS configuration
const allowedOrigins = ['http://your-allowed-origin.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware for security headers
router.use(helmet());

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

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Retrieve a list of active alerts
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of alerts to return
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Number of alerts to skip
 *         required: false
 *         schema:
 *           type: integer
 *       - name: type
 *         in: query
 *         description: Filter alerts by type
 *         required: false
 *         schema:
 *           type: string
 *           enum: [price, risk]
 *       - name: sort
 *         in: query
 *         description: Sort order for alerts
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: A list of alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AlertMessage'
 *       204:
 *         description: No alerts found
 */
router.get('/api/alerts', async (req, res) => {
    req.query = sanitize(req.query);
    try {
        const pagination = validatePaginationRequest(req.query);
        const alerts = await alertController.getActiveAlerts({
            query: pagination
        }, res);
        return res.status(200).json(alerts);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve alerts.' });
    }
});

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAlertRequest'
 *     responses:
 *       201:
 *         description: Created alert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlertMessage'
 *       400:
 *         description: Invalid alert data
 */
router.post('/api/alerts', async (req, res) => {
    req.body = sanitize(req.body);
    try {
        const alert = validateCreateAlertRequest(req.body);
        const createdAlert = await alertController.addAlert({ body: alert }, res);
        logAudit('CREATE_ALERT', { alert: createdAlert });
        return res.status(201).json(createdAlert);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: 'Validation Error: ' + error.message });
        }
        return res.status(500).json({ message: 'Failed to create alert.' });
    }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update an existing alert
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the alert to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threshold:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated alert
 *       404:
 *         description: Alert not found
 */
router.put('/api/alerts/:id', async (req, res) => {
    req.body = sanitize(req.body);
    await alertController.updateAlert(req, res);
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the alert to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Alert deleted
 *       404:
 *         description: Alert not found
 */
router.delete('/api/alerts/:id', async (req, res) => {
    const alertId = req.params.id;
    const success = await alertController.deleteAlert(req, res);
    if (success) logAudit('DELETE_ALERT', { alertId });
});

export default router;