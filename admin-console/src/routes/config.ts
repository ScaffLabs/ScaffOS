// Import necessary modules
import express from 'express';
import { body, validationResult } from 'express-validator';
import Database from '../storage/Database';
import { ConfigurationItem } from '../types';
import { NotFoundError } from '../errors/CustomErrors';

const router = express.Router();
const db = new Database();

/**
 * @swagger
 * /api/config:
 *   post:
 *     tags: [Configurations]
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
 */
router.post('/', [
    body('key').isString().notEmpty().withMessage('Key is required'),
    body('value').isString().notEmpty().withMessage('Value is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        await db.createConfiguration({ key, value });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/config:
 *   get:
 *     tags: [Configurations]
 *     summary: Get all configurations with pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset for pagination
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *         description: Order of sorting (asc/desc)
 *     responses:
 *       200:
 *         description: A list of configurations
 *       500:
 *         description: Failed to retrieve configurations
 */
router.get('/', async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
    try {
        const configurations = await db.getConfigurations({ limit, offset, sortBy, order });
        res.status(200).json(configurations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve configurations' });
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     tags: [Configurations]
 *     summary: Get a configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: Configuration key
 *     responses:
 *       200:
 *         description: Configuration found
 *       404:
 *         description: Configuration not found
 */
router.get('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const configuration = await db.getConfigurationByKey(key);
        if (!configuration) {
            throw new NotFoundError('Configuration not found');
        }
        res.status(200).json(configuration);
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/config:
 *   put:
 *     tags: [Configurations]
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
 *       400:
 *         description: Invalid input
 */
router.put('/', [
    body('key').isString().notEmpty().withMessage('Key is required'),
    body('value').isString().notEmpty().withMessage('Value is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        await db.updateConfiguration({ key, value });
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   delete:
 *     tags: [Configurations]
 *     summary: Delete a configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: Configuration key
 *     responses:
 *       204:
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 */
router.delete('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        await db.deleteConfiguration(key);
        res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;