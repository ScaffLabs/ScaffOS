import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { ServiceError } from '../errors/serviceError';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { StorageManager } from '../storage/storageManager';
import { publish } from '../publisher';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import { config } from '../config';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

export const createEvent = async (req: Request, res: Response) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    const start = Date.now();
    try {
        const parsed = createEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const newEvent: Event = { id: uuidv4(), ...parsed.data };
        const createdEvent = await storage.create(newEvent);
        await publish({ topic: 'eventCreated', data: createdEvent, timestamp: Date.now() });
        res.status(201).json(createdEvent);
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        if (error instanceof ValidationError) {
            res.status(400).json({ message: error.message });
        } else if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export const getEvents = async (req: Request<{}, {}, {}, GetEventsQuery>, res: Response) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    const start = Date.now();
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
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export const getEventById = async (req: Request, res: Response) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    const start = Date.now();
    try {
        const event = await storage.read(req.params.id);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.status(200).json(event);
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    const start = Date.now();
    try {
        const parsed = updateEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const updatedEvent = await storage.update(req.params.id, parsed.data);
        if (!updatedEvent) {
            throw new NotFoundError('Event not found');
        }
        res.status(200).json(updatedEvent);
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    const start = Date.now();
    try {
        const deleted = await storage.delete(req.params.id);
        if (!deleted) {
            throw new NotFoundError('Event not found');
        }
        res.status(204).send();
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        if (error instanceof NotFoundError) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    }
};