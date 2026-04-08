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

export const bulkCreateEvents = async (req: Request, res: Response) => {
    const operations = req.body.map(async (eventData: any) => {
        const parsed = createEventSchema.safeParse(eventData);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const newEvent: Event = { id: uuidv4() as OrderId, ...parsed.data };
        return await storage.create(newEvent);
    });
    try {
        await storage.transaction(operations);
        res.status(201).json({ message: 'All events created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};