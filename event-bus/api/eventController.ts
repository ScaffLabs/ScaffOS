import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';
import { ServiceError } from '../errors/serviceError';
import rateLimit from 'express-rate-limit';

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

const handleError = (error: Error, res: Response) => {
    if (error instanceof ValidationError) {
        logger.warn({ message: error.message });
        return res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        logger.warn({ message: error.message });
        return res.status(404).json({ message: error.message });
    } else if (error instanceof ServiceError) {
        logger.error(error);
        return res.status(500).json({ message: error.message });
    } else {
        logger.error(error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
export default router;