import { Router } from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from './eventController';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import logger from '../logger';
import { checkHealthEndpoint, healthCheckMiddleware } from './healthCheck';
import csrf from 'csurf';
import sanitizer from 'express-sanitizer';
import { validateCreateEvent, validateUpdateEvent } from '../middleware/validationMiddleware';

const router = Router();

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware for setting security headers
router.use(helmet());

// CSRF protection
const csrfProtection = csrf({ cookie: true });
router.use(csrfProtection);

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

router.use(sanitizer()); // Use sanitizer middleware to sanitize inputs

// Input validation and sanitization for the event routes
router.post('/', validateCreateEvent, createEvent);
router.get('/', getEvents);
router.put('/:id', validateUpdateEvent, updateEvent);
router.delete('/:id', deleteEvent);

// Middleware to validate JSON content type
router.use((req, res, next) => {
    if (req.is('application/json')) {
        next();
    } else {
        return res.status(415).send({ message: 'Unsupported Media Type' });
    }
});

export default router;