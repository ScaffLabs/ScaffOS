import express from 'express';
import bodyParser from 'body-parser';
import { healthCheck, readyCheck } from './health';
import { orderRouter } from './orderController';
import { migrateData } from './migrations';
import { setupGracefulShutdown } from './shutdown';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { requestIdMiddleware, errorHandlingMiddleware } from './middleware';
import { body, validationResult } from 'express-validator';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://allowed-origin.com', 'http://another-allowed-origin.com'] }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(requestIdMiddleware);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Input Validation for Order Creation
app.post('/orders', [
    body('id').isString().withMessage('ID must be a string'),
    body('type').isIn(['limit', 'market', 'stop']).withMessage('Invalid order type'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be a positive integer'),
    body('status').isIn(['open', 'filled', 'cancelled']).withMessage('Invalid status')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
});

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
orderRouter(app);

const startServer = async () => {
    await migrateData();
    setupGracefulShutdown(app);
    const server = app.listen(PORT, () => {
        console.log(`Order Engine listening on port ${PORT}`);
    });
    return server;
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

app.use(errorHandlingMiddleware);