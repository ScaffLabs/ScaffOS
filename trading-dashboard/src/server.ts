import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import errorHandler, { gracefulShutdownHandler } from './middleware/errorHandler';
import requestLogger from './middleware/requestLogger';
import { registerRoutes } from './api/portfolioApi';
import logger from './utils/logger';
import config from './config';
import { registerExternalApiRoutes } from './api/externalApi';
import { registerHealthRoutes } from './utils/healthCheck';
import { closePool } from './utils/connectionPool';

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(helmet()); // Set security HTTP headers

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
app.use(cors({ origin: allowedOrigins })); // Enable CORS with allowed origins

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

registerRoutes(app);
registerExternalApiRoutes(app);
registerHealthRoutes(app);

app.use(gracefulShutdownHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await closePool();
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