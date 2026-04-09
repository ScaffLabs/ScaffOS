import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';
import rateLimit from 'express-rate-limit';
import { ServiceError } from '../errors/serviceError';
import { sanitize } from 'express-validator';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

const createEventLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many event creation requests, please try again later.',
});

const logAudit = (action: string, eventId?: string) => {
    logger.info({ action, eventId, timestamp: new Date() });
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        logAudit('create', event.id);
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res);
    }
};

export const getEvents = async (req: Request<{}, {}, {}, GetEventsQuery>, res: Response): Promise<void> => {
    try {
        const { limit = 10, offset = 0, sortBy = 'createdAt', order = 'asc' } = req.query;
        const events = await storage.findAll(Number(limit), Number(offset));
        if (events.length === 0) {
            throw new NotFoundError('No events found');
        }
        const sortedEvents = events.sort((a, b) => {
            if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });
        res.status(200).json(sortedEvents);
    } catch (error) {
        handleError(error, res);
    }
};

export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const eventId = req.params.id;
        const updatedEvent = await storage.update(eventId, validation.data);
        if (!updatedEvent) {
            throw new NotFoundError(`Event with id ${eventId} not found`);
        }
        logAudit('update', eventId);
        res.status(200).json(updatedEvent);
    } catch (error) {
        handleError(error, res);
    }
};

export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventId = req.params.id;
        const deleted = await storage.delete(eventId);
        if (!deleted) {
            throw new NotFoundError(`Event with id ${eventId} not found`);
        }
        logAudit('delete', eventId);
        res.status(204).send();
    } catch (error) {
        handleError(error, res);
    }
};

const handleError = (error: Error, res: Response) => {
    if (error instanceof ValidationError) {
        logger.warn({ message: error.message });
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        logger.warn({ message: error.message });
        res.status(404).json({ message: error.message });
    } else if (error instanceof ServiceError) {
        logger.error(error);
        res.status(500).json({ message: error.message });
    } else {
        logger.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const router = Router();
router.post('/', createEventLimiter, [sanitize('title').escape(), sanitize('description').escape()], createEvent);
router.get('/', getEvents);
router.put('/:id', [sanitize('title').escape()], updateEvent);
router.delete('/:id', deleteEvent);
export default router;