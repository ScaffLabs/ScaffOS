import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';

const router = express.Router();
const db = new Database();

// Middleware for pagination and sorting
const paginationMiddleware = (req, res, next) => {
    const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
    req.pagination = { limit: parseInt(limit), offset: parseInt(offset), sortBy, order };
    next();
};

/**
 * @openapi
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
 *         description: Invalid request body
 */
router.post('/', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value }: ConfigurationItem = req.body;
        await db.createConfiguration({ key, value });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

/**
 * @openapi
 * /api/config:
 *   get:
 *     summary: Retrieve all configurations with pagination and sorting
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of items to return
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: offset
 *         in: query
 *         description: Number of items to skip before starting to collect the result set
 *         required: false
 *         schema:
 *           type: integer
 *           default: 0
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         required: false
 *         schema:
 *           type: string
 *           default: key
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         required: false
 *         schema:
 *           type: string
 *           default: asc
 *     responses:
 *       200:
 *         description: A list of configurations
 */
router.get('/', paginationMiddleware, async (req, res) => {
    try {
        const { limit, offset, sortBy, order } = req.pagination;
        const configurations = await db.findAll({ limit, offset, sortBy, order });
        res.json(configurations);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configurations' });
    }
});

/**
 * @openapi
 * /api/config/{key}:
 *   get:
 *     summary: Get configuration by key
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: The key of the configuration to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration found
 *       404:
 *         description: Configuration not found
 */
router.get('/:key', async (req, res) => {
    try {
        const item = await db.readConfiguration(req.params.key);
        if (!item) return res.status(404).json({ error: 'Configuration not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

/**
 * @openapi
 * /api/config:
 *   put:
 *     summary: Update a configuration
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
 */
router.put('/', async (req, res) => {
    const { key, value }: ConfigurationItem = req.body;
    try {
        await db.updateConfiguration({ key, value });
        res.json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

/**
 * @openapi
 * /api/config/{key}:
 *   delete:
 *     summary: Delete a configuration by key
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: The key of the configuration to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 */
router.delete('/:key', async (req, res) => {
    try {
        await db.deleteConfiguration(req.params.key);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;