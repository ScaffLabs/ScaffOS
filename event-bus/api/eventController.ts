import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import logger from '../logger';
import { ServiceError } from '../errors/serviceError';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

// Create a new event
const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate incoming request data against the schema
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        // Store the new event in memory
        const event = await storage.create(validation.data);
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res);
    }
};

// Retrieve all events with optional pagination
const getEvents = async (req: Request, res: Response): Promise<void> => {
    const { limit = 10, offset = 0 }: GetEventsQuery = req.query;
    try {
        const events = await storage.findAll(limit, offset);
        if (events.length === 0) {
            throw new NotFoundError('No events found'); // Throw a 404 if no events exist
        }
        res.status(200).json(events);
    } catch (error) {
        handleError(error, res);
    }
};

// Update an existing event by ID
const updateEvent = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.update(id, validation.data);
        if (!event) {
            throw new NotFoundError('Event not found'); // Handle case where event ID does not exist
        }
        res.status(200).json(event);
    } catch (error) {
        handleError(error, res);
    }
};

// Delete an event by ID
const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const deleted = await storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Event not found'); // Handle case where event ID does not exist
        }
        res.status(204).send();
    } catch (error) {
        handleError(error, res);
    }
};

// Centralized error handling to respond with appropriate status codes
const handleError = (error: Error, res: Response) => {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message }); // Bad Request for validation errors
    } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message }); // Not Found for missing resources
    } else if (error instanceof ServiceError) {
        res.status(500).json({ message: 'Service error occurred.' }); // Internal Server Error for service issues
    } else {
        res.status(500).json({ message: 'Internal Server Error' }); // Fallback for unexpected errors
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
export default router;