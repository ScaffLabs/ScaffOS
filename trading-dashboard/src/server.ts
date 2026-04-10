import express from 'express';
import { securityMiddleware, validateAndLog, validateRequestSize } from './middleware/securityMiddleware';
import { registerHealthRoutes } from './utils/healthCheck';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { registerRoutes } from './api/portfolioApi';
import { registerExternalApiRoutes } from './api/externalApi';
import logger from './utils/logger';
import config from './config';
import rateLimit from 'express-rate-limit';

const app = express();

logger.logStartup(config);
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
securityMiddleware(app);

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many requests, please try again later.',
});

app.use(limiter); // Apply rate limiting to all routes

app.use(validateRequestSize('1mb')); // Custom middleware to limit request size
registerHealthRoutes(app);
registerRoutes(app);
registerExternalApiRoutes(app);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Force shutdown after 30 seconds');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;