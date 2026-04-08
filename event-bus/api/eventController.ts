import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import sanitizer from 'express-sanitizer';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

// Middleware for sanitizing inputs
export const sanitizeInputs = (req: Request, res: Response, next: Function) => {
    req.body = req.sanitize(req.body);
    next();
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        logger.logSensitiveOperation('createEvent', { data: event }); // Log the operation
        res.status(201).json(event);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await storage.findAll();
        if (!events.length) throw new NotFoundError('No events found');
        res.status(200).json(events);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// Add sanitizeInputs middleware to routes
const router = Router();
router.post('/', sanitizeInputs, createEvent);
router.get('/', sanitizeInputs, getEvents);

export default router;