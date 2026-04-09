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
import { logRequest, requestIdMiddleware } from './middleware';
import config from './config';
import { checkUserServiceHealth, checkOrderServiceHealth } from './interServiceClient';
import { emitUserCreatedEvent } from './eventBus';

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
app.use(requestIdMiddleware);
app.use(logRequest);

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorMiddleware);

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

const checkServiceHealth = async () => {
    try {
        const userServiceHealthy = await checkUserServiceHealth();
        const orderServiceHealthy = await checkOrderServiceHealth();
        return userServiceHealthy && orderServiceHealthy;
    } catch (error) {
        logger.error('Service health check failed', { error: error.message });
        return false;
    }
};

process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await connectionPool.drain();
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    await connectionPool.drain();
    server.close(() => {
        logger.info('HTTP server closed');
    });
});

process.on('uncaughtException', async (err) => {
    logger.error('Uncaught Exception: ', err);
    await connectionPool.drain();
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    logger.error('Unhandled Rejection: ', reason);
    await connectionPool.drain();
    process.exit(1);
});

start();

// Emit user created event to notify other services
app.post('/api/users', async (req, res) => {
    const user = await createUser(req.body.username, req.body.email);
    emitUserCreatedEvent(user);
    res.status(201).json(user);
});

export default app;