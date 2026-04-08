import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { StorageManager } from '../storage/storageManager';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

export const createEvent = async (req: Request, res: Response) => {
    try {
        const parsed = createEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const newEvent: Event = { id: uuidv4() as OrderId, ...parsed.data };
        const createdEvent = await storage.create(newEvent);
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;
        const events = await storage.findAll(limit, offset);
        res.json(events);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    try {
        const eventId = req.params.id;
        const event = await storage.read(eventId);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const eventId = req.params.id;
        const parsed = updateEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.update(eventId, parsed.data);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const eventId = req.params.id;
        const success = await storage.delete(eventId);
        if (!success) {
            throw new NotFoundError('Event not found');
        }
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};