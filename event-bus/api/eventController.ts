import { Request, Response, Router } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { StorageManager } from '../storage/storageManager';
import eventBus from '../eventBus';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import rateLimit from 'express-rate-limit';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' }
});

export const createEvent = async (req: Request, res: Response) => {
    try {
        const parsed = createEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const newEvent: Event = { id: uuidv4() as OrderId, ...parsed.data, createdAt: new Date(), updatedAt: new Date() };
        const createdEvent = await storage.create(newEvent);
        eventBus.publish('eventCreated', createdEvent);
        res.status(201).json(createdEvent);
    } catch (error) {
        handleErrors(error, res);
    }
};

export const getEvents = async (req: Request<{}, {}, {}, GetEventsQuery>, res: Response) => {
    const { limit = 10, offset = 0, sortBy = 'createdAt', order = 'asc' } = req.query;
    try {
        const events = await storage.findAll(Number(limit), Number(offset));
        if (!events || events.length === 0) {
            throw new NotFoundError('No events found');
        }
        const sortedEvents = events.sort((a, b) => {
            const compare = a[sortBy] > b[sortBy] ? 1 : -1;
            return order === 'asc' ? compare : -compare;
        });
        res.status(200).json(sortedEvents);
    } catch (error) {
        handleErrors(error, res);
    }
};

export const updateEvent = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    try {
        const existingEvent = await storage.read(id);
        if (!existingEvent) {
            throw new NotFoundError('Event not found');
        }
        const parsed = updateEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const updatedEvent = await storage.update(id, { ...parsed.data, updatedAt: new Date() });
        res.status(200).json(updatedEvent);
    } catch (error) {
        handleErrors(error, res);
    }
};

export const deleteEvent = async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Event not found');
        }
        res.status(204).send();
    } catch (error) {
        handleErrors(error, res);
    }
};

const handleErrors = (error: Error, res: Response) => {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
    } else {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const eventRoutes = () => {
    const router = Router();
    router.post('/', limiter, createEvent);
    router.get('/', getEvents);
    router.put('/:id', updateEvent);
    router.delete('/:id', deleteEvent);
    return router;
};