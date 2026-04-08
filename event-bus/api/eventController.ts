import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event } from '../types';

let events: Event[] = [];

// Create a new event
export const createEvent = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        if (!title || typeof title !== 'string') {
            throw new ValidationError('Invalid title');
        }
        const newEvent: Event = { id: events.length + 1, title, description };
        events.push(newEvent);
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all events with pagination and sorting
export const getEvents = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const offset = Number(req.query.offset) || 0;
        if (limit < 0 || offset < 0) {
            throw new ValidationError('Limit and offset must be non-negative');
        }
        const sortedEvents = events.sort((a, b) => a.title.localeCompare(b.title));
        const paginatedEvents = sortedEvents.slice(offset, offset + limit);
        res.json(paginatedEvents);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get an event by ID
export const getEventById = async (req: Request, res: Response) => {
    try {
        const eventId = Number(req.params.id);
        if (isNaN(eventId)) {
            throw new ValidationError('Invalid event ID');
        }
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update an event
export const updateEvent = async (req: Request, res: Response) => {
    try {
        const eventId = Number(req.params.id);
        const event = events.find(e => e.id === eventId);
        if (!event) {
            throw new NotFoundError('Event not found');
        }
        const { title, description } = req.body;
        if (title && typeof title !== 'string') {
            throw new ValidationError('Invalid title');
        }
        if (title) event.title = title;
        if (description && typeof description !== 'string') {
            throw new ValidationError('Invalid description');
        }
        if (description) event.description = description;
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an event
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        const eventId = Number(req.params.id);
        const index = events.findIndex(e => e.id === eventId);
        if (index === -1) {
            throw new NotFoundError('Event not found');
        }
        events.splice(index, 1);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};