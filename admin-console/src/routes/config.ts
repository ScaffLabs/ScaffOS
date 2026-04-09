import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { logRequest } from '../middleware/logger';
import { emitEvent } from '../events/EventBus';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import sanitize from 'sanitize-html';

const router = express.Router();
const db = new Database();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        const sanitizedConfigItem = {
            key: sanitize(configItem.key),
            value: sanitize(configItem.value),
        };
        ConfigurationItemSchema.parse(sanitizedConfigItem);
        await db.createConfiguration(sanitizedConfigItem);
        emitEvent('CONFIGURATION_CREATED', sanitizedConfigItem);
        logRequest.info({ message: 'Configuration created', configItem });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        return next(error);
    }
});

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