import { Request, Response } from 'express';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { StorageManager } from '../storage/storageManager';
import { publish } from '../publisher';
import axios from 'axios';
import { config } from '../config';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

const MAX_RETRIES = 3;

const callExternalService = async (url: string) => {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            if (i === MAX_RETRIES - 1) {
                throw new Error('Failed to reach external service after retries');
            }
        }
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        const parsed = createEventSchema.safeParse(req.body);
        if (!parsed.success) {
            throw new ValidationError(parsed.error.errors.map(err => err.message).join(', '));
        }
        const newEvent: Event = { id: uuidv4() as OrderId, ...parsed.data };
        const createdEvent = await storage.create(newEvent);
        await publish({ topic: 'eventCreated', data: createdEvent, timestamp: Date.now() });
        await callExternalService(`${config.OTHER_SERVICE_URL}/notify`);
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(error instanceof ValidationError ? 400 : 500).json({ message: error.message });
    }
};