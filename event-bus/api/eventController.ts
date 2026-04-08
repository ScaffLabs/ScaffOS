import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { StorageManager } from '../storage/storageManager';
import { publish } from '../publisher';
import { v4 as uuidv4 } from 'uuid';
import logger from '../logger';
import axios from 'axios';
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

export const checkExternalServiceHealth = async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${config.OTHER_SERVICE_URL}/health`);
        if (response.status === 200) {
            res.status(200).json({ status: 'healthy' });
        } else {
            res.status(503).json({ status: 'unhealthy' });
        }
    } catch (error) {
        res.status(503).json({ status: 'unhealthy', error: error.message });
        logger.logError(error, req.headers['x-request-id'] || 'unknown');
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
        res.status(error instanceof NotFoundError ? 404 : 500).json({ message: error.message });
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
        res.status(error instanceof NotFoundError ? 404 : 500).json({ message: error.message });
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
        res.status(error instanceof NotFoundError ? 404 : 500).json({ message: error.message });
    }
};
