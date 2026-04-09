import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { HealthCheck } from './health-check';
import { config } from './config';
import logger, { logStartup } from './logger';
import bodyParser from 'body-parser';
import { errorMiddleware } from './error.middleware';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logAudit } from './audit.logger';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);

app.use(helmet()); // Set security headers
app.use(cors({ origin: ['http://your-allowed-origin.com'] })); // CORS configuration

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: (req, res) => {
        return res.status(429).json({ message: 'Too many requests, please try again later.' });
    }
});
app.use(limiter);

app.use(bodyParser.json({ limit: '1mb' })); // Limit request size

// Health check routes
app.get('/health', HealthCheck.checkHealth);
app.get('/ready', HealthCheck.checkReady);

app.use(errorMiddleware);

const server = app.listen(config.PORT, () => {
    logStartup(config);
    logger.info(`Alert system running on port ${config.PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await mongoose.connection.close();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', shutdown);
process.on('unhandledRejection', shutdown);

app.use((req, res, next) => {
    res.on('finish', () => {
        logAudit(req.method + ' ' + req.path, { status: res.statusCode });
    });
    next();
});

process.on('error', (error) => {
    logger.error(error, { context: 'Global Error Handler' });
});
