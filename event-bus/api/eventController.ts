import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

/**
 * Create a new event.
 * @param req - Express request object.
 * @param res - Express response object.
 * @throws {ValidationError} If validation of the request body fails.
 * @returns {Promise<void>} A promise that resolves when the event is created.
 */
export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        res.status(201).json(event);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

/**
 * Get all events.
 * @param req - Express request object.
 * @param res - Express response object.
 * @throws {NotFoundError} If no events are found.
 * @returns {Promise<void>} A promise that resolves with the events.
 */
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