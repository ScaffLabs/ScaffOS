import { Router } from 'express';
import { AlertController } from './alert.controller';
import { validateCreateAlertRequest, validatePaginationRequest } from './alert.schema';
import { ValidationError, NotFoundError } from './error.types';
import rateLimit from 'express-rate-limit';
import { sanitize } from './sanitization';

const alertController = new AlertController();
const router = Router();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});

router.use(limiter);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get active alerts
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of alerts to return
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Offset for pagination
 *         schema:
 *           type: integer
 *       - name: type
 *         in: query
 *         required: false
 *         description: Filter alerts by type
 *         schema:
 *           type: string
 *           enum: [price, risk]
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Sort order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: A list of active alerts
 *       204:
 *         description: No content
 */
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
 *         description: The created alert
 *       400:
 *         description: Validation error
 */
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

/**
 * @swagger
 * /api/alerts/{id}:
 *   put:
 *     summary: Update an alert
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The alert ID
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
 *         description: The updated alert
 *       404:
 *         description: Alert not found
 */
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

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The alert ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Alert not found
 */
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