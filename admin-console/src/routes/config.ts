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
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        logRequest.info({ message: 'Configuration created', configItem, requestId });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        next(error instanceof ValidationError ? new ValidationError('Invalid configuration data') : error);
    }
});

router.delete('/:key', async (req, res, next) => {
    const { key } = req.params;
    const requestId = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    try {
        await db.deleteConfiguration(key);
        emitEvent('CONFIGURATION_DELETED', { key });
        logRequest.info({ message: 'Configuration deleted', key, requestId });
        res.status(204).send();
    } catch (error) {
        next(error instanceof NotFoundError ? new NotFoundError('Configuration not found') : error);
    }
});

export default router;