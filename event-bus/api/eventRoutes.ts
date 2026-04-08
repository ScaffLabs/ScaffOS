import { Router } from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent, checkExternalServiceHealth } from './eventController';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
});

// Event routes
router.post('/', limiter, createEvent);
router.get('/', limiter, getEvents);
router.get('/:id', limiter, getEventById);
router.put('/:id', limiter, updateEvent);
router.delete('/:id', limiter, deleteEvent);
router.get('/health', limiter, checkExternalServiceHealth);

export default router;
