import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event, createEventSchema, updateEventSchema } from '../types';
import { ValidationError } from '../errors/validationError';
import { NotFoundError } from '../errors/notFoundError';
import { ServiceError } from '../errors/serviceError';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = createEventSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ValidationError(validation.error.errors.map(err => err.message).join(', '));
        }
        const event = await storage.create(validation.data);
        res.status(201).json(event);
    } catch (error) {
        handleError(error, res);
    }
};

export const seedData = async (req: Request, res: Response): Promise<void> => {
    try {
        await storageManager.seedData();
        res.status(200).json({ message: 'Data seeded successfully' });
    } catch (error) {
        handleError(error, res);
    }
};

export const migrateData = async (req: Request, res: Response): Promise<void> => {
    try {
        await storageManager.migrate();
        res.status(200).json({ message: 'Migration performed successfully' });
    } catch (error) {
        handleError(error, res);
    }
};

const handleError = (error: Error, res: Response) => {
    if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
    } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
    } else if (error instanceof ServiceError) {
        res.status(500).json({ message: error.message });
    } else {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const router = Router();
router.post('/', createEvent);
router.post('/seed', seedData);
router.post('/migrate', migrateData);
export default router;