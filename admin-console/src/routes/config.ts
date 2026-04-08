import express from 'express';
import { ConfigurationItem } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError, ServiceError } from '../errors/CustomErrors';
import { logger } from '../middleware/logger';
import { ConfigurationItemSchema } from '../types';

const router = express.Router();
const db = new Database();

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Create a new configuration
 *     tags: [Configuration]
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
router.post('/', async (req, res) => {
    const configItem: ConfigurationItem = req.body;
    try {
        // Validate input data
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        logger.info(`Configuration created: ${configItem.key}`);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.error(`Validation error: ${error.message}`);
            return res.status(400).json({ error: error.message });
        }
        logger.error(`Error creating configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Retrieve configurations with pagination and sorting
 *     tags: [Configuration]
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
 *       - in: query
 *         name: sortBy
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of configurations
 */
router.get('/', async (req, res) => {
    const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
    try {
        const configurations = await db.getConfigurations({ limit: Number(limit), offset: Number(offset), sortBy, order });
        res.status(200).json(configurations);
    } catch (error) {
        logger.error(`Error fetching configurations: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch configurations' });
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     summary: Retrieve a configuration by key
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration found
 *       404:
 *         description: Configuration not found
 */
router.get('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        const config = await db.getConfigurationByKey(key);
        if (!config) {
            throw new NotFoundError('Configuration not found');
        }
        res.status(200).json(config);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        logger.error(`Error fetching configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

/**
 * @swagger
 * /api/config:
 *   put:
 *     summary: Update an existing configuration
 *     tags: [Configuration]
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
 *         description: Invalid request body
 *       404:
 *         description: Configuration not found
 */
router.put('/', async (req, res) => {
    const configItem: ConfigurationItem = req.body;
    try {
        // Validate input data
        ConfigurationItemSchema.parse(configItem);
        const existingConfig = await db.getConfigurationByKey(configItem.key);
        if (!existingConfig) {
            throw new NotFoundError('Configuration not found');
        }
        await db.updateConfiguration(configItem);
        logger.info(`Configuration updated: ${configItem.key}`);
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.error(`Validation error: ${error.message}`);
            return res.status(400).json({ error: error.message });
        }
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        logger.error(`Error updating configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   delete:
 *     summary: Delete a configuration by key
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
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
        logger.info(`Configuration deleted: ${key}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting configuration: ${error.message}`);
        res.status(404).json({ error: 'Configuration not found' });
    }
});

export default router;