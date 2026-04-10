import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from './eventController';
import rateLimit from 'express-rate-limit';
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
router.use(limiter);

// Health check middleware
router.use(healthCheckMiddleware);
router.get('/health', checkHealthEndpoint);

router.post('/', createEvent);
router.get('/', getEvents);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
