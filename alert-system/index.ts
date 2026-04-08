import express from 'express';
import mongoose from 'mongoose';
import { EventBus } from '../event-bus';
import { AlertProcessor } from './alert.processor';
import { HealthCheck } from './health-check';
import { config } from './config';
import logger, { logStartup } from './logger';
import bodyParser from 'body-parser';
import pLimit from 'p-limit';
import { MongoClient } from 'mongodb';

const app = express();
const eventBus = new EventBus();
const alertProcessor = new AlertProcessor(eventBus);
const limit = pLimit(5); // Limit concurrency for database connections

app.use(bodyParser.json({ limit: '1mb' })); // Limit request size

app.get('/health', HealthCheck.checkHealth);
app.get('/ready', HealthCheck.checkReady);

const mongoClient = new MongoClient(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const connectDatabase = async () => {
    const retries = 5;
    for (let i = 0; i < retries; i++) {
        try {
            await mongoClient.connect();
            logger.info('Connected to MongoDB');
            break;
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            if (i < retries - 1) {
                await new Promise(res => setTimeout(res, 5000)); // Wait before retrying
            } else {
                process.exit(1);
            }
        }
    }
};

connectDatabase();

const server = app.listen(config.PORT, () => {
    logStartup(config);
    logger.info(`Alert system running on port ${config.PORT}`);
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await mongoClient.close();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', shutdown);
process.on('unhandledRejection', shutdown);