import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';
import { checkServiceHealth } from './eventService';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res);
    }
};

const healthCheck = async (req: Request, res: Response): Promise<void> => {
    const isHealthy = await checkServiceHealth();
    res.status(isHealthy ? 200 : 503).json({ healthy: isHealthy });
};

const router = Router();
router.post('/', createEvent);
router.get('/health', healthCheck);
export default router;