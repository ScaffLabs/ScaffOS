import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { logRequest } from '../middleware/logger';
import { emitEvent } from '../events/EventBus';

const router = express.Router();
const db = new Database('in-memory');

router.post('/', async (req, res, next) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        logRequest.info(`Configuration created: ${configItem.key}`);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        next(error instanceof ValidationError ? new ValidationError('Invalid configuration data') : error);
    }
});

router.delete('/:key', async (req, res, next) => {
    const { key } = req.params;
    try {
        await db.deleteConfiguration(key);
        emitEvent('CONFIGURATION_DELETED', { key });
        logRequest.info(`Configuration deleted: ${key}`);
        res.status(204).send();
    } catch (error) {
        next(error instanceof NotFoundError ? new NotFoundError('Configuration not found') : error);
    }
});

export default router;