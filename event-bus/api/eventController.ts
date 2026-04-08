import { Request, Response, Router } from 'express';
import { StorageManager } from '../storage/storageManager';
import { Event } from '../types';

const storageManager = new StorageManager<Event>('memory');
const storage = storageManager.getStorage();

export const seedData = async (req: Request, res: Response) => {
    try {
        await storageManager.seedData();
        res.status(200).json({ message: 'Seed data created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error seeding data', error: error.message });
    }
};

export const eventRoutes = () => {
    const router = Router();
    router.post('/seed', seedData);
    // other routes...
    return router;
};