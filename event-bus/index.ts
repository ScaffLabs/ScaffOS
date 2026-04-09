import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { requestLogger, errorLogger } from './middleware/loggingMiddleware';
import { initializeRedis } from './config/redis.config';
import eventRoutes from './api/eventRoutes';
import logger from './logger';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(cors({
    origin: ['http://example.com', 'http://anotherdomain.com'], // Replace with actual allowed origins
}));
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

const main = async () => {
    await initializeRedis();
    logger.info(`Configuration: ${JSON.stringify(config)}`);
    app.use('/events', eventRoutes());
    app.use(errorLogger);
    app.use(errorHandler);
    const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });

    const gracefulShutdown = async () => {
        logger.info('Shutting down gracefully...');
        await server.close();
        logger.info('HTTP server closed');
        process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
};

main();