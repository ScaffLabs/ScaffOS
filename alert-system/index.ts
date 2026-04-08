import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { HealthCheck } from './health-check';
import { config } from './config';
import logger, { logStartup } from './logger';
import bodyParser from 'body-parser';
import { errorMiddleware } from './error.middleware';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);

app.use(bodyParser.json({ limit: '1mb' })); // Limit request size
app.get('/health', HealthCheck.checkHealth);
app.get('/ready', HealthCheck.checkReady);

app.use(errorMiddleware); // Use error handling middleware after all routes

const server = app.listen(config.PORT, () => {
    logStartup(config);
    logger.info(`Alert system running on port ${config.PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await mongoose.connection.close(); // Close mongoose connections
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', shutdown);
process.on('unhandledRejection', shutdown);