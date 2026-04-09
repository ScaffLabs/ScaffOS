import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { Request, Response, NextFunction } from 'express';
import sanitize from 'sanitize-html';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const db = new Database();

// Rate limiter for configuration endpoints
const configRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

// Create Configuration
router.post('/', configRateLimiter, async (req: Request, res: Response, next: NextFunction) => {
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

// Get All Configurations with Pagination and Filtering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 10, offset = 0, sortBy = 'key', order = 'asc' } = req.query;
        const configurations = await db.findAllConfigurations();
        const filteredConfigs = configurations.sort((a, b) => {
            if (sortBy === 'value') {
                return order === 'asc' ? a.value.localeCompare(b.value) : b.value.localeCompare(a.value);
            }
            return order === 'asc' ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key);
        });
        const paginatedConfigs = filteredConfigs.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedConfigs);
    } catch (error) {
        return next(error);
    }
});

// Get Configuration by Key
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

// Update Configuration
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        if (!configItem || !configItem.key || !configItem.value) {
            throw new ValidationError('Key and Value are required.');
        }
        const sanitizedConfigItem = {
            key: sanitize(configItem.key),
            value: sanitize(configItem.value),
        };
        await db.updateConfiguration(sanitizedConfigItem);
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        } else if (error instanceof NotFoundError) {
            return next(new NotFoundError('Configuration not found')); 
        }
        return next(error);
    }
});

// Delete Configuration
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