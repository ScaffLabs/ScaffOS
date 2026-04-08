import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './health';
import userRoutes from './userRoutes';
import errorMiddleware from './errorMiddleware';
import logger, { startupLog } from './logger';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';
import { logRequest } from './logger';
import { csrfMiddleware } from './middleware';
import { rateLimit as apiRateLimit } from './rateLimit';
import { sanitizeInput } from './middleware';
import { body, validationResult } from 'express-validator';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logRequest);

const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorMiddleware);
app.use(csrfMiddleware);

const validateAndSanitizeInput = (req, res, next) => {
    body('username')
        .isString()
        .trim()
        .notEmpty()
        .customSanitizer(value => sanitizeInput(value));
    body('email')
        .isEmail()
        .normalizeEmail()
        .customSanitizer(value => sanitizeInput(value));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

app.post('/api/users', validateAndSanitizeInput, async (req, res) => {
    // User creation logic
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    try {
        await connectionPool.drain();
        server.close(() => {
            logger.info('HTTP server closed.');
            process.exit(0);
        });
    } catch (error) {
        logger.error('Error during shutdown: ' + error.message);
        process.exit(1);
    }
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const start = async () => {
    try {
        await connectionPool.isReady();
        monitorMemoryUsage();
        server.listen(PORT, () => {
            startupLog(`Auth Layer Service`);
            logger.info(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Error starting server', { error: error.message });
        process.exit(1);
    }
};

start();