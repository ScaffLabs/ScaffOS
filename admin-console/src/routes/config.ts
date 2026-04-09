import express from 'express';
import { ConfigurationItem } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { logRequest } from '../middleware/logger';

const router = express.Router();
const db = new Database('in-memory');

router.post('/', async (req, res) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        logRequest.info(`Configuration created: ${configItem.key}`);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        logRequest.error(`Error creating configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to create configuration' });
    }
});

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
        logRequest.error(`Error fetching configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch configuration' });
    }
});

router.delete('/:key', async (req, res) => {
    const { key } = req.params;
    try {
        await db.deleteConfiguration(key);
        logRequest.info(`Configuration deleted: ${key}`);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ error: error.message });
        }
        logRequest.error(`Error deleting configuration: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete configuration' });
    }
});

export default router;