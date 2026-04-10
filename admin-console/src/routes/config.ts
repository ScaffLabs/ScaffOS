import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError, ServiceError } from '../errors/CustomErrors';
import { Request, Response, NextFunction } from 'express';
import { logRequest, logAudit } from '../middleware/logger';
import rateLimiter from '../middleware/rateLimiter';
import { sanitizeQueryParams } from '../middleware/sanitization';
import { emitEvent } from '../events/EventBus';

const router = express.Router();
const db = new Database();

router.use(logRequest);
router.use(sanitizeQueryParams);
router.use(rateLimiter);
router.use(logAudit);

// Create Configuration
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        return next(new ServiceError('Error creating configuration: ' + error.message));
    }
});

// Delete Configuration
router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.params.key;
        await db.deleteConfiguration(key);
        emitEvent('CONFIGURATION_DELETED', { key });
        res.status(204).send();
    } catch (error) {
        return next(new ServiceError('Error deleting configuration: ' + error.message));
    }
});

export default router;