import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

const createEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        const duration = Date.now() - start;
        logger.logRequest(req.method, req.originalUrl, 201, duration, reqId);
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const getEvents = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    const { limit = 10, offset = 0, sortBy = 'createdAt', order = 'asc' }: GetEventsQuery = req.query;
    try {
        const events = await storage.findAll(limit, offset);
        if (events.length === 0) {
            throw new NotFoundError('No events found');
        }
        const sortedEvents = order === 'asc' ? events.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1) : events.sort((a, b) => a[sortBy] < b[sortBy] ? 1 : -1);
        const duration = Date.now() - start;
        logger.logRequest(req.method, req.originalUrl, 200, duration, reqId);
        res.status(200).json(sortedEvents);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const handleError = (error: Error, res: Response, reqId: string) => {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
        logger.warn({ message: error.message, reqId });
    } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
        logger.warn({ message: error.message, reqId });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
        logger.error(error, reqId);
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
export default router;