import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent, checkHealthEndpoint } from './eventController';
import csrf from 'csurf';
import { validateCreateEvent, validateUpdateEvent } from '../middleware/validationMiddleware';

const csrfProtection = csrf({ cookie: true });
const router = Router();

router.use(csrfProtection);

router.get('/', getEvents);
router.post('/', validateCreateEvent, createEvent);
router.put('/:id', validateUpdateEvent, updateEvent);
router.delete('/:id', deleteEvent);
router.get('/health', checkHealthEndpoint);

export default router;