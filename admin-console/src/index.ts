import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import healthRouter from './routes/health';
import config from './config';
import Database from './storage/Database';
import http from 'http';
import errorHandler from './middleware/errorHandler';
import { logRequest, logError, logSuccess } from './middleware/logger';
import rateLimiter from './middleware/rateLimiter';
import { EventEmitter } from 'events';

dotenv.config();
const app = express();
const server = http.createServer(app);
const db = new Database();
const eventBus = new EventEmitter();

app.use(helmet());
app.use(cors());
app.use(rateLimiter);
app.use(bodyParser.json());
app.use(logRequest);
app.use('/api/health', healthRouter);
app.use(errorHandler);

const startServer = async () => {
    await db.connect(config.databaseUrl);
    logSuccess(`Database connected: ${config.databaseUrl}`);
    server.listen(config.port, () => {
        logSuccess(`Server running on http://localhost:${config.port}`);
    });
};

startServer();

const shutdown = async () => {
    logSuccess('Shutting down gracefully...');
    await db.closeConnection();
    server.close(() => {
        logSuccess('Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);