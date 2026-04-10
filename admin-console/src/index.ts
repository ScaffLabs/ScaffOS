import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import config from './config';
import Database from './storage/Database';
import healthRouter from './routes/health';
import configRouter from './routes/config';
import errorHandler from './middleware/errorHandler';
import { logRequest } from './middleware/logger';
import rateLimiter from './middleware/rateLimiter';
import cors from 'cors';
import { sanitizeBody, sanitizeQueryParams } from './middleware/sanitization';
import winston from 'winston';

dotenv.config();
const app = express();
const db = new Database();

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        process.env.NODE_ENV === 'development' ? winston.format.prettyPrint() : winston.format.json(),
        winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-domain.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(sanitizeBody);
app.use(sanitizeQueryParams);
app.use(rateLimiter);
app.use(logRequest);
app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use(errorHandler);

const gracefulShutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    await db.closeConnection();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
    try {
        await db.connect();
        const server = app.listen(config.port, () => {
            logger.info(`Server running on http://localhost:${config.port}`);
            logger.info(`Environment: ${config.nodeEnv}`);
        });
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
    }
};

startServer();
