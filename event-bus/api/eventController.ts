import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { StorageManager } from '../storage/storageManager';
import { publish } from '../publisher';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';

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
        const newEvent: Event = { id: uuidv4() as OrderId, ...parsed.data };
        const createdEvent = await storage.create(newEvent);
        await publish({ topic: 'eventCreated', data: createdEvent, timestamp: Date.now() });
        res.status(201).json(createdEvent);
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        res.status(error instanceof ValidationError ? 400 : 500).json({ message: error.message });
    }
};

export const getEvents = async (req: Request<{}, {}, {}, GetEventsQuery>, res: Response) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    const start = Date.now();
    try {
        const events = await storage.findAll();
        res.status(200).json(events);
        logger.logRequest(req.method, req.path, res.statusCode, Date.now() - start, reqId);
    } catch (error) {
        logger.logError(error, reqId);
        res.status(500).json({ message: error.message });
    }
};