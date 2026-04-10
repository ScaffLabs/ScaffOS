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
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        logger.info(`Event created: ${event.id}`, { reqId });
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const getEvents = async (req: Request, res: Response): Promise<void> => {
    const { limit = 10, offset = 0, sortBy, order }: GetEventsQuery = req.query;
    try {
        let events = await storage.findAll(limit, offset);
        if (sortBy) {
            events = events.sort((a, b) => {
                const isAsc = order === 'asc';
                return isAsc ? (a[sortBy] > b[sortBy] ? 1 : -1) : (a[sortBy] < b[sortBy] ? 1 : -1);
            });
        }
        if (!events.length) {
            throw new NotFoundError('No events found');
        }
        logger.info(`Fetched events: ${events.length}`, { reqId: req.headers['x-request-id'] || 'unknown' });
        res.json(events);
    } catch (error) {
        handleError(error, res, req.headers['x-request-id'] || 'unknown');
    }
};

const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const { id } = req.params;
    try {
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const updatedEvent = await storage.update(id, validation.data);
        if (!updatedEvent) {
            throw new NotFoundError('Event not found');
        }
        logger.info(`Event updated: ${id}`, { reqId });
        res.json(updatedEvent);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const { id } = req.params;
    try {
        const success = await storage.delete(id);
        if (!success) {
            throw new NotFoundError('Event not found');
        }
        logger.info(`Event deleted: ${id}`, { reqId });
        res.status(204).send();
    } catch (error) {
        handleError(error, res, reqId);
    }
};

const handleError = (error: Error, res: Response, reqId: string) => {
    logger.error(error.message, { reqId });
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
export default router;