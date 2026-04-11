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

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        return res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        next(new ServiceError('Error creating configuration: ' + error.message));
    }
});

router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.params;
    try {
        const config = await db.readConfiguration(key);
        if (!config) throw new NotFoundError('Configuration not found');
        res.status(200).json(config);
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = req.query.sortBy as string || 'key';
    const order = req.query.order as string || 'asc';

    try {
        const configurations = await db.findAllConfigurations();
        const filteredConfigs = configurations
            .sort((a, b) => {
                if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
                if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
                return 0;
            })
            .slice(offset, offset + limit);
        if (filteredConfigs.length === 0) throw new NotFoundError('No configurations found.');
        return res.status(200).json(filteredConfigs);
    } catch (error) {
        next(new ServiceError('Error fetching configurations: ' + error.message));
    }
});

router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        ConfigurationItemSchema.parse(configItem);
        await db.updateConfiguration(configItem);
        emitEvent('CONFIGURATION_UPDATED', configItem);
        return res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        next(new ServiceError('Error updating configuration: ' + error.message));
    }
});

router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const key = req.params.key;
    try {
        await db.deleteConfiguration(key);
        emitEvent('CONFIGURATION_DELETED', { key });
        return res.status(204).send();
    } catch (error) {
        next(new ServiceError('Error deleting configuration: ' + error.message));
    }
});

export default router;