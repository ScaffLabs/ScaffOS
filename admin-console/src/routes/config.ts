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
        // Validate the incoming configuration item against the schema
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        emitEvent('CONFIGURATION_CREATED', configItem);
        return res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        // Handle validation errors specifically
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        // Handle service errors and log them
        next(new ServiceError('Error creating configuration: ' + error.message));
    }
});

// Read Configuration by Key
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

// Get All Configurations with Pagination and Filtering
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // max limit 100
    const offset = parseInt(req.query.offset as string) || 0;
    const sortBy = req.query.sortBy as string || 'key';
    const order = req.query.order as string || 'asc';

    try {
        const configurations = await db.findAllConfigurations();
        const filteredConfigs = configurations
            .sort((a, b) => {
                // Sorting logic based on the specified field and order
                if (a[sortBy] < b[sortBy]) return order === 'asc' ? -1 : 1;
                if (a[sortBy] > b[sortBy]) return order === 'asc' ? 1 : -1;
                return 0;
            })
            .slice(offset, offset + limit);
        if (filteredConfigs.length === 0) throw new NotFoundError('No configurations found.');
        return res.status(200).json(filteredConfigs);
    } catch (error) {
        // Log and forward errors to the error handler
        next(new ServiceError('Error fetching configurations: ' + error.message));
    }
});

// Update Configuration
router.put('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        // Validate the configuration item before updating
        ConfigurationItemSchema.parse(configItem);
        await db.updateConfiguration(configItem);
        emitEvent('CONFIGURATION_UPDATED', configItem);
        return res.status(200).json({ message: 'Configuration updated successfully!' });
    } catch (error) {
        // Handle validation errors specifically
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        // Handle service errors and log them
        next(new ServiceError('Error updating configuration: ' + error.message));
    }
});

// Delete Configuration
router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
    const key = req.params.key;
    try {
        await db.deleteConfiguration(key);
        emitEvent('CONFIGURATION_DELETED', { key });
        return res.status(204).send();
    } catch (error) {
        // Handle service errors and log them
        next(new ServiceError('Error deleting configuration: ' + error.message));
    }
});

export default router;