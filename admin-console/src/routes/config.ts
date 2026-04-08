import express from 'express';
import { ConfigurationItem } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError, ServiceError } from '../errors/CustomErrors';
import { logger } from '../middleware/logger';
import { ConfigurationItemSchema } from '../types';

const router = express.Router();
const db = new Database();

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

router.get('/', async (req, res) => {
    try {
        const configurations = await db.getConfigurations({ limit: 100, offset: 0, sortBy: 'key', order: 'asc' });
        res.status(200).json(configurations);
    } catch (error) {
        logger.error(`Error fetching configurations: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch configurations' });
    }
});

router.put('/', async (req, res) => {
    const configItem: ConfigurationItem = req.body;
    try {
        // Validate input data
        ConfigurationItemSchema.parse(configItem);
        await db.updateConfiguration(configItem);
        logger.info(`Configuration updated: ${configItem.key}`);
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            logger.error(`Validation error: ${error.message}`);
            return res.status(400).json({ error: error.message });
        }
        logger.error(`Error updating configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to update configuration' });
    }
});

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