import { Router } from 'express';
import { AlertController } from './alert.controller';
import rateLimit from 'express-rate-limit';
import { validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';

const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);
const router = Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Alert management
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Retrieve a list of alerts
 *     tags: [Alerts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of alerts
 *       204:
 *         description: No content
 */
router.get('/api/alerts', limiter, async (req, res) => {
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

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               threshold:
 *                 type: number
 *               currentValue:
 *                 type: number
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Invalid alert data
 */
router.post('/api/alerts', limiter, async (req, res) => {
    try {
        const alert = validateAlertMessage(req.body);
        const createdAlert = await alertStore.create(alert);
        return res.status(201).json(createdAlert);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: 'Invalid alert data: ' + error.message });
        }
        console.error(error);
        return res.status(500).json({ message: 'Failed to create alert.' });
    }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update an existing alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the alert to update
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
 *         description: Alert updated successfully
 *       404:
 *         description: Alert not found
 */
router.put('/api/alerts/:id', limiter, async (req, res) => {
    const alertId = req.params.id;
    try {
        const updatedAlert = await alertStore.update(alertId, req.body);
        if (!updatedAlert) {
            return res.status(404).json({ message: 'Alert not found.' });
        }
        return res.json(updatedAlert);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to update alert.' });
    }
});

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an existing alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the alert to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 */
router.delete('/api/alerts/:id', limiter, async (req, res) => {
    const alertId = req.params.id;
    try {
        const deleted = await alertStore.delete(alertId);
        if (!deleted) {
            return res.status(404).json({ message: 'Alert not found.' });
        }
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to delete alert.' });
    }
});

export default router;