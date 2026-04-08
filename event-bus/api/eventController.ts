import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event } from '../types';

let events: Event[] = [];

// Create a new event
export const createEvent = async (req: Request, res: Response) => {
    const { title, description } = req.body;
    if (!title || typeof title !== 'string') {
        throw new ValidationError('Invalid title');
    }
    const newEvent: Event = { id: events.length + 1, title, description };
    events.push(newEvent);
    res.status(201).json(newEvent);
};

// Get all events with pagination and sorting
export const getEvents = async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const sortedEvents = events.sort((a, b) => a.title.localeCompare(b.title));
    const paginatedEvents = sortedEvents.slice(offset, offset + limit);
    res.json(paginatedEvents);
};

// Get an event by ID
export const getEventById = async (req: Request, res: Response) => {
    const eventId = Number(req.params.id);
    const event = events.find(e => e.id === eventId);
    if (!event) {
        throw new NotFoundError('Event not found');
    }
    res.json(event);
};

// Update an event
export const updateEvent = async (req: Request, res: Response) => {
    const eventId = Number(req.params.id);
    const event = events.find(e => e.id === eventId);
    if (!event) {
        throw new NotFoundError('Event not found');
    }
    const { title, description } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    res.json(event);
};

// Delete an event
export const deleteEvent = async (req: Request, res: Response) => {
    const eventId = Number(req.params.id);
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) {
        throw new NotFoundError('Event not found');
    }
    events.splice(index, 1);
    res.status(204).send();
};
