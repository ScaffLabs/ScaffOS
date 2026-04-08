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
app.use(cors({ origin: ['http://example.com', 'http://anotherdomain.com'] })); // Change to allowed origins
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

app.use(requestLogger);
app.use(express.json({ limit: '1mb' })); // Limit request size to 1 MB

const main = async () => {
    await initializeRedis();
    logger.info(`Configuration: ${JSON.stringify(config)}`);
    app.use('/events', eventRoutes());
    app.use(errorLogger);
    app.use(errorHandler); // Centralized error handling middleware
    const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });

    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT signal received: closing HTTP server');
        server.close(() => {
            logger.info('HTTP server closed');
            process.exit(0);
        });
    });
};

main();