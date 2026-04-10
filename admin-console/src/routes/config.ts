import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { Request, Response, NextFunction } from 'express';
import { logRequest, logAudit } from '../middleware/logger';
import rateLimiter from '../middleware/rateLimiter';
import { sanitizeQueryParams } from '../middleware/sanitization';

const router = express.Router();
const db = new Database();

router.use(logRequest);
router.use(sanitizeQueryParams);
router.use(rateLimiter);
router.use(logAudit);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        return next(new ServiceError('Error creating configuration: ' + error.message));
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allConfigs = await db.findAllConfigurations();
        if (allConfigs.length === 0) {
            return next(new ValidationError('No configurations found.')); // Handle empty array case
        }
        res.status(200).json(allConfigs);
    } catch (error) {
        return next(new ServiceError('Error fetching configurations: ' + error.message));
    }
});

router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const config = await db.readConfiguration(req.params.key);
        if (!config) {
            throw new NotFoundError('Configuration not found');
        }
        res.status(200).json(config);
    } catch (error) {
        return next(new ServiceError('Error retrieving configuration: ' + error.message));
    }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.updateConfiguration(configItem);
        res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        return next(new ServiceError('Error updating configuration: ' + error.message));
    }
});

router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await db.deleteConfiguration(req.params.key);
        res.status(204).send();
    } catch (error) {
        return next(new ServiceError('Error deleting configuration: ' + error.message));
    }
});

export default router;
