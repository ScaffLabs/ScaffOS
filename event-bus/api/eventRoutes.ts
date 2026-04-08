import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent, checkHealthEndpoint } from './eventController';
import csrf from 'csurf';
import { validateCreateEvent, validateUpdateEvent } from '../middleware/validationMiddleware';
import rateLimit from 'express-rate-limit';
import { sanitize } from 'express-validator';

const csrfProtection = csrf({ cookie: true });
const router = Router();

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

router.use(limiter);
router.use(csrfProtection);

router.get('/', getEvents);
router.post('/', [sanitize('title').escape(), sanitize('description').escape(), validateCreateEvent], createEvent);
router.put('/:id', [sanitize('title').escape(), validateUpdateEvent], updateEvent);
router.delete('/:id', deleteEvent);
router.get('/health', checkHealthEndpoint);

export default router;