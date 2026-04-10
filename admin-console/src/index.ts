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
import { ValidationError, ServiceError } from './errors/CustomErrors';

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
            console.log(`Server running on http://localhost:${config.port}`);
            console.log(`Environment: ${config.nodeEnv}`);
        });

        // Graceful shutdown handling
        const shutdown = async () => {
            console.log('Shutting down gracefully...');
            await db.closeConnection();
            server.close(() => {
                console.log('HTTP server closed.');
                process.exit(0);
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        if (error instanceof ValidationError) {
            console.error(`Validation Error: ${error.message}`);
        } else if (error instanceof ServiceError) {
            console.error(`Service Error: ${error.message}`);
        } else {
            console.error(`Failed to start server: ${error.message}`);
        }
    }
};

startServer();
