import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

export const createEvent = async (req: Request, res: Response) => {
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

export const getEvents = async (req: Request, res: Response) => {
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

export const updateEvent = async (req: Request, res: Response) => {
    try {
        const validation = updateEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const updatedEvent = await storage.update(req.params.id, validation.data);
        if (!updatedEvent) throw new NotFoundError('Event not found');
        res.status(200).json(updatedEvent);
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const deleted = await storage.delete(req.params.id);
        if (!deleted) throw new NotFoundError('Event not found');
        res.status(204).send();
    } catch (error) {
        if (error instanceof NotFoundError) {
            return res.status(404).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const seedData = async (req: Request, res: Response) => {
    try {
        await storageManager.seedData();
        res.status(200).json({ message: 'Seed data created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error seeding data', error: error.message });
    }
};

export const eventRoutes = () => {
    const router = Router();
    router.post('/', createEvent);
    router.get('/', getEvents);
    router.put('/:id', updateEvent);
    router.delete('/:id', deleteEvent);
    router.post('/seed', seedData);
    return router;
};