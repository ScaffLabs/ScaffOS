import express from 'express';
import { securityMiddleware, validateAndLog } from './middleware/securityMiddleware';
import { registerHealthRoutes } from './utils/healthCheck';
import errorHandler from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { registerRoutes } from './api/portfolioApi';
import { registerExternalApiRoutes } from './api/externalApi';
import logger from './utils/logger';
import config from './config';
import { applyRateLimiting } from './middleware/rateLimiter';

const app = express();
logger.logStartup(config);
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
securityMiddleware(app);
applyRateLimiting(app);
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