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

dotenv.config();
const app = express();
const db = new Database();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(rateLimiter);
app.use(logRequest);
app.use('/api/health', healthRouter);
app.use('/api/config', configRouter);
app.use(errorHandler);

const startServer = async () => {
    try {
        await db.connect();
        const server = app.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`);
            console.log(`Configuration: ${JSON.stringify(config)}`);
        });

        // Log connected services
        console.log(`Connected to database: ${config.databaseUrl}`);

        const gracefulShutdown = (signal) => {
            console.log(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                console.log('Closed out remaining connections.');
                await db.closeConnection();
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    } catch (error) {
        throw new ServiceError(`Failed to start server: ${error.message}`);
    }
};

startServer();