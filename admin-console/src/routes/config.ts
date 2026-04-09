import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { logRequest } from '../middleware/logger';
import { emitEvent } from '../events/EventBus';
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const router = express.Router();
const db = new Database();

const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(10),
    offset: Joi.number().integer().min(0).default(0),
    sortBy: Joi.string().valid('key', 'value').default('key'),
    order: Joi.string().valid('asc', 'desc').default('asc')
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
        return next(new ValidationError(error.details[0].message));
    }

    const { limit, offset, sortBy, order } = value;
    try {
        const configs = await db.findAll();
        const sortedConfigs = configs.sort((a, b) => (
            order === 'asc' ? a[sortBy] > b[sortBy] ? 1 : -1 : a[sortBy] < b[sortBy] ? 1 : -1
        ));
        const paginatedConfigs = sortedConfigs.slice(offset, offset + limit);
        res.status(200).json(paginatedConfigs);
    } catch (error) {
        return next(error);
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        logRequest.info({ message: 'Configuration created', configItem });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data'));
        }
        return next(error);
    }
});

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