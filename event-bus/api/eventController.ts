import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { StorageManager } from '../storage/storageManager';
import { v4 as uuidv4 } from 'uuid';

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
        res.status(error instanceof ValidationError ? 400 : 500).json({ message: error.message });
    }
};

export const getEvents = async (req: Request, res: Response) => {
    try {
        const { limit = 10, offset = 0, sortBy = 'title', order = 'asc' } = req.query;
        const events = await storage.findAll(Number(limit), Number(offset));
        const sortedEvents = events.sort((a, b) => {
            if (order === 'asc') return a[sortBy].localeCompare(b[sortBy]);
            return b[sortBy].localeCompare(a[sortBy]);
        });
        res.status(200).json(sortedEvents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve events' });
    }
};

export const getEventById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const event = await storage.read(id);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(error instanceof NotFoundError ? 404 : 500).json({ message: error.message });
    }
};

export const updateEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const parsed = updateEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const updatedEvent = await storage.update(id, parsed.data);
        if (!updatedEvent) {
            throw new NotFoundError('Event not found');
        }
        res.status(200).json(updatedEvent);
    } catch (error) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({ message: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deleted = await storage.delete(id);
        if (!deleted) {
            throw new NotFoundError('Event not found');
        }
        res.status(204).send();
    } catch (error) {
        res.status(error instanceof NotFoundError ? 404 : 500).json({ message: error.message });
    }
};