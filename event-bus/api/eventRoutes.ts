import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent, checkHealthEndpoint } from './eventController';
import { gracefulShutdown } from './healthCheck';

const router = Router();

router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.get('/health', checkHealthEndpoint);

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default router;