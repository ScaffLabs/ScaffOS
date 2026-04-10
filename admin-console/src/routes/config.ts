import express from 'express';
import { ConfigurationItem, ConfigurationItemSchema } from '../types';
import Database from '../storage/Database';
import { ValidationError, NotFoundError } from '../errors/CustomErrors';
import { Request, Response, NextFunction } from 'express';
import { logRequest } from '../middleware/logger';

const router = express.Router();
const db = new Database();

// Middleware to log requests
router.use(logRequest);

// Create Configuration
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const configItem: ConfigurationItem = req.body;
    try {
        if (!configItem || !configItem.key || !configItem.value) {
            throw new ValidationError('Key and Value are required.');
        }
        ConfigurationItemSchema.parse(configItem);
        await db.createConfiguration(configItem);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        if (error instanceof ValidationError) {
            return next(new ValidationError('Invalid configuration data: ' + error.message));
        }
        return next(error);
    }
});

// Other routes unchanged...  

export default router;