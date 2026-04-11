import { Request, Response, Router } from 'express';
import { InMemoryEventStorage } from '../storage/InMemoryEventStorage';
import { Event, createEventSchema, updateEventSchema } from '../types';
import logger from '../logger';
import { NotFoundError } from '../errors/notFoundError';
import { ValidationError } from '../errors/validationError';
import { ServiceError } from '../errors/serviceError';

const storage = new InMemoryEventStorage();

const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        logger.info(`Event created: ${event.id}`);
        res.status(201).json(event);
    } catch (error) {
        handleError(res, error);
    }
};

const getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const events = await storage.findAll(Number(limit), Number(offset));
        if (events.length === 0) {
            throw new NotFoundError('No events found');
        }
        logger.info(`Fetched ${events.length} events`);
        res.json(events);
    } catch (error) {
        handleError(res, error);
    }
};

const updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.update(id, validation.data);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        logger.info(`Event updated: ${event.id}`);
        res.json(event);
    } catch (error) {
        handleError(res, error);
    }
};

const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deleted = await storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Event not found');
        }
        logger.info(`Event deleted: ${id}`);
        res.status(204).send();
    } catch (error) {
        handleError(res, error);
    }
};

const handleError = (res: Response, error: Error) => {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
    } else if (error instanceof ServiceError) {
        res.status(500).json({ message: error.message });
    } else {
        logger.error(`Internal Server Error: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
export default router;