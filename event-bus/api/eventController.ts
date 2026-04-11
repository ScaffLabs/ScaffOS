import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema } from '../types';
import logger from '../logger';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.errors.map(err => err.message).join(', ') });
        }
        const event = await storage.create(validation.data);
        logger.info(`Event created: ${event.id}`);
        res.status(201).json(event);
    } catch (error) {
        logger.error(`Error creating event: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await storage.findAll();
        logger.info(`Fetched ${events.length} events`);
        res.json(events);
    } catch (error) {
        logger.error(`Error fetching events: ${error.message}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const router = Router();
router.post('/', createEvent);
router.get('/', getEvents);
export default router;
