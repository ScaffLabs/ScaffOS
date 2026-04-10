import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import config from './config';
import Database from './storage/Database';
import healthRouter from './routes/health';
import configRouter from './routes/config';
import errorHandler from './middleware/errorHandler';
import { logRequest, logError } from './middleware/logger';
import rateLimiter from './middleware/rateLimiter';
import cors from 'cors';
import { sanitizeBody, sanitizeQueryParams } from './middleware/sanitization';

dotenv.config();
const app = express();
const db = new Database();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(sanitizeBody);
app.use(sanitizeQueryParams);
app.use(rateLimiter);
app.use(logRequest); // Logging requests

app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use(logError); // Logging errors
app.use(errorHandler);

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