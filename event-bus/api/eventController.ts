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
        logger.info({ message: 'Event created', reqId, duration });
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
        const sortedEvents = events.sort((a, b) => {
            return order === 'asc' ? a[sortBy] > b[sortBy] ? 1 : -1 : a[sortBy] < b[sortBy] ? 1 : -1;
        });
        const duration = Date.now() - start;
        logger.info({ message: 'Events retrieved', reqId, duration });
        res.status(200).json(sortedEvents);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    const { id } = req.params;
    try {
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.update(id, validation.data);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        const duration = Date.now() - start;
        logger.info({ message: 'Event updated', reqId, duration });
        res.status(200).json(event);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    const { id } = req.params;
    try {
        const deleted = await storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Event not found');
        }
        const duration = Date.now() - start;
        logger.info({ message: 'Event deleted', reqId, duration });
        res.status(204).send();
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const handleError = (error: Error, res: Response, reqId: string) => {
    if (error instanceof ValidationError) {
        logger.warn({ message: error.message, reqId });
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        logger.warn({ message: error.message, reqId });
        res.status(404).json({ message: error.message });
    } else {
        logger.error('Internal Server Error', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
export default router;