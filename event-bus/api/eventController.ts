import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema, GetEventsQuery } from '../types';
import { StorageManager } from '../storage/storageManager';
import { publish } from '../publisher';
import { v4 as uuidv4 } from 'uuid';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create an event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 */
export const createEvent = async (req: Request, res: Response) => {
    try {
        const parsed = createEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const newEvent: Event = { id: uuidv4() as OrderId, ...parsed.data };
        const createdEvent = await storage.create(newEvent);
        await publish({ topic: 'eventCreated', data: createdEvent, timestamp: Date.now() });
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(error instanceof ValidationError ? 400 : 500).json({ message: error.message });
    }
};

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get a list of events
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Number of events to return
 *         required: false
 *         schema:
 *           type: integer
 *       - name: offset
 *         in: query
 *         description: Number of events to skip
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of events
 */
export const getEvents = async (req: Request<{}, {}, {}, GetEventsQuery>, res: Response) => {
    const { limit = 10, offset = 0, sortBy = 'id', order = 'asc' } = req.query;
    try {
        const events = await storage.findAll(Number(limit), Number(offset));
        const sortedEvents = events.sort((a, b) => {
            if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
            return a[sortBy] < b[sortBy] ? 1 : -1;
        });
        res.status(200).json(sortedEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};