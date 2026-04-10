import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from './eventController';
import rateLimit from 'express-rate-limit';
import { sanitize } from 'express-validator';
import cors from 'cors';
import helmet from 'helmet';
import logger from '../logger';
import { checkHealthEndpoint, healthCheckMiddleware } from './healthCheck';

const router = Router();

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware for setting security headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
router.use(limiter);

// Health check middleware
router.use(healthCheckMiddleware);
router.get('/health', checkHealthEndpoint);

// Endpoint to handle event creation with sanitization
router.post('/', [
    sanitize('title').trim().escape(),
    sanitize('description').trim().escape(),
    createEvent
]);

router.get('/', getEvents);
router.put('/:id', [
    sanitize('title').trim().escape(),
    updateEvent
]);
router.delete('/:id', deleteEvent);

export default router;