import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';
import { logAudit } from '../middleware/auditLogger';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';

const router = express.Router();
const db = new Database();

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Retrieve all configurations
 *     parameters:
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of items to return
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: offset
 *         in: query
 *         required: false
 *         description: Number of items to skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: key
 *       - name: order
 *         in: query
 *         required: false
 *         description: Order of sorting (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: A list of configurations
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
    try {
        const items = await db.findAll({ limit: Number(limit), offset: Number(offset), sortBy, order });
        res.json(items);
    } catch (error) {
        console.error('Fetch Configurations Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Create a new configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       201:
 *         description: Configuration created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], logAudit, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.createConfiguration({ key, value });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        console.error('Create Configuration Error:', error);
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     summary: Retrieve a configuration by key
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: The key of the configuration
 *     responses:
 *       200:
 *         description: The requested configuration
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */
router.get('/:key', async (req, res) => {
    try {
        const item = await db.readConfiguration(req.params.key);
        if (!item) return res.status(404).json({ error: 'Configuration not found' });
        res.json(item);
    } catch (error) {
        console.error('Get Configuration Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Update an existing configuration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *       404:
 *         description: Configuration not found
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.put('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], logAudit, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.updateConfiguration({ key, value });
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        console.error('Update Configuration Error:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   delete:
 *     summary: Delete a configuration by key
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: The key of the configuration to delete
 *     responses:
 *       204:
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */
router.delete('/:key', async (req, res) => {
    try {
        await db.deleteConfiguration(req.params.key);
        res.status(204).send();
    } catch (error) {
        console.error('Delete Configuration Error:', error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: 'Configuration not found' });
        }
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;