import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';
import { ServiceError } from '../errors/serviceError';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

/**
 * Creates a new event.
 * Validates the request body against the createEventSchema before proceeding.
 * Logs the request ID and duration for performance monitoring.
 */
const createEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    try {
        // Validate incoming request body
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        // Store the event in the storage
        const event = await storage.create(validation.data);
        const duration = Date.now() - start;
        logger.info({ message: 'Event created', reqId, duration });
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

/**
 * Retrieves a list of events.
 * Supports pagination and sorting through query parameters.
 */
const getEvents = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    const { limit = 10, offset = 0, sortBy = 'createdAt', order = 'asc' }: GetEventsQuery = req.query;
    try {
        const events = await storage.findAll(limit, offset);
        if (events.length === 0) {
            throw new NotFoundError('No events found');
        }
        // Sort the events based on the requested sort field and order
        const sortedEvents = events.sort((a, b) => {
            return order === 'asc' ? (a[sortBy] > b[sortBy] ? 1 : -1) : (a[sortBy] < b[sortBy] ? 1 : -1);
        });
        const duration = Date.now() - start;
        logger.info({ message: 'Events retrieved', reqId, duration });
        res.status(200).json(sortedEvents);
    } catch (error) {
        handleError(error, res, reqId);
    }
};

/**
 * Updates an existing event based on the provided ID.
 * Validates the request body against the updateEventSchema before proceeding.
 */
const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    const { id } = req.params;
    try {
        // Validate incoming request body for updates
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        // Update the event in the storage
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

/**
 * Deletes an event based on the provided ID.
 */
const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    const reqId = req.headers['x-request-id'] || 'unknown';
    const start = Date.now();
    const { id } = req.params;
    try {
        // Delete the event from storage
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

/**
 * Centralized error handling function for API responses.
 */
const handleError = (error: Error, res: Response, reqId: string) => {
    if (error instanceof ValidationError) {
        logger.warn({ message: error.message, reqId });
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        logger.warn({ message: error.message, reqId });
        res.status(404).json({ message: error.message });
    } else if (error instanceof ServiceError) {
        logger.error({ message: error.message, reqId });
        res.status(500).json({ message: 'Service error occurred.' });
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