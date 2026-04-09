import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { logRequest } from '../middleware/logger';
import { emitEvent } from '../events/EventBus';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const router = express.Router();
const db = new Database('in-memory');

// Pagination and sorting schema
const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string().valid('key', 'value').default('key'),
    order: Joi.string().valid('asc', 'desc').default('asc')
});

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Retrieve a list of configurations with pagination and sorting
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to return
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
 *         description: Order of sorting
 *     responses:
 *       200:
 *         description: A list of configurations
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
        return next(new ValidationError(error.details[0].message));
    }

    const { limit, offset, sortBy, order } = value;
    try {
        const configs = await db.findAll();
        const sortedConfigs = configs.sort((a, b) => {
            if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });
        const paginatedConfigs = sortedConfigs.slice(offset, offset + limit);
        res.status(200).json(paginatedConfigs);
    } catch (error) {
        return next(error);
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
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        logRequest.info({ message: 'Configuration created', configItem, requestId });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data'));
        }
        return next(error);
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     summary: Retrieve a configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The configuration key
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration found
 *       404:
 *         description: Configuration not found
 */
router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    try {
        const config = await db.read(key);
        if (!config) {
            throw new NotFoundError('Configuration not found');
        }
        res.status(200).json(config);
    } catch (error) {
        return next(error);
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
 */
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.update(configItem.key, configItem);
        emitEvent('CONFIGURATION_UPDATED', configItem);
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof NotFoundError) {
            return next(new NotFoundError('Configuration not found'));
        }
        return next(error);
    }
});

/**
 * @swagger
 * /api/config/{key}:
 *   delete:
 *     summary: Delete a configuration by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The configuration key
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Configuration deleted successfully
 *       404:
 *         description: Configuration not found
 */
router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    try {
        await db.deleteConfiguration(key);
        emitEvent('CONFIGURATION_DELETED', { key });
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return next(new NotFoundError('Configuration not found'));
        }
        return next(error);
    }
});

export default router;