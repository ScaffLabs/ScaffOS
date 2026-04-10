import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import config from './config';
import Database from './storage/Database';
import healthRouter from './routes/health';
import configRouter from './routes/config';
import errorHandler from './middleware/errorHandler';
import { logRequest, logError, logPerformance } from './middleware/logger';
import rateLimiter from './middleware/rateLimiter';
import cors from 'cors';
import { sanitizeBody, sanitizeQueryParams } from './middleware/sanitization';

dotenv.config();
const app = express();
const db = new Database();

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
app.use(logError);
app.use(errorHandler);

const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    await db.closeConnection();
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
    try {
        await db.connect();
        const server = app.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`);
        });
    } catch (error) {
        console.error(`Failed to start server: ${error.message}`);
    }
};

startServer();