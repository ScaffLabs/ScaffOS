import { Router } from 'express';
import { AlertController } from './alert.controller';
import { HealthCheck } from './health-check';
import rateLimit from 'express-rate-limit';
import { validateAlertMessage } from './alert.schema';
import { AlertStore } from './storage';
import helmet from 'helmet';
import cors from 'cors';

const alertStore = new AlertStore();
const alertController = new AlertController(alertStore);
const router = Router();

// CORS configuration
const allowedOrigins = ['http://your-allowed-origin.com'];
router.use(cors({ origin: allowedOrigins }));

// Helmet middleware to set secure HTTP headers
router.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
router.use(limiter);

// Health check routes
router.get('/health', HealthCheck.checkHealth);
router.get('/ready', HealthCheck.checkReady);

// Alert routes
router.get('/api/alerts', async (req, res) => {
    // ... existing alert fetching logic
});

router.post('/api/alerts', async (req, res) => {
    // ... existing alert creation logic
});

router.put('/api/alerts/:id', async (req, res) => {
    // ... existing alert updating logic
});

router.delete('/api/alerts/:id', async (req, res) => {
    // ... existing alert deletion logic
});

export default router;