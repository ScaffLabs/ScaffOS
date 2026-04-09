import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { Request, Response, NextFunction } from 'express';
import sanitize from 'sanitize-html';

const router = express.Router();
const db = new Database();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        if (!configItem || !configItem.key || !configItem.value) {
            throw new ValidationError('Key and Value are required.');
        }
        const sanitizedConfigItem = {
            key: sanitize(configItem.key),
            value: sanitize(configItem.value),
        };
        ConfigurationItemSchema.parse(sanitizedConfigItem);
        await db.createConfiguration(sanitizedConfigItem);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        return next(error);
    }
});

router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    try {
        const config = await db.readConfiguration(key);
        if (!config) {
            throw new NotFoundError('Configuration not found.');
        }
        res.status(200).json(config);
    } catch (error) {
        return next(error);
    }
});

router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    try {
        if (!key) {
            throw new ValidationError('Configuration key is required.');
        }
        await db.deleteConfiguration(key);
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return next(new NotFoundError('Configuration not found')); 
        }
        return next(error);
    }
});

export default router;