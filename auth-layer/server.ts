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

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(express.urlencoded({ extended: true }));
app.use(logRequest);

// Rate limiting middleware
const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter); // Apply to all API routes
app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorMiddleware);

const start = async () => {
    try {
        await createConnectionPool();
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

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
start();