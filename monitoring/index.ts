import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { EventEmitter } from 'events';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger, { logRequest, logStartup } from './logger';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { limiter } from './rateLimiter';
import config from './config';
import { createConnectionPool } from './connectionPool';

const app = express();
const PORT = config.PORT;
const server = createServer(app);
const io = new Server(server);
const eventEmitter = new EventEmitter();
const connectionPool = createConnectionPool();

app.use(helmet());
app.use(cors({ origin: ['https://example.com', 'https://another-domain.com'] }));
app.use(limiter);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(logRequest);

app.get('/health', healthCheck);
app.use(errorMiddleware);

process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught Exception');
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Rejection');
});

const gracefulShutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
        logger.info('Closed out remaining connections.');
        connectionPool.close();
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
    logStartup();
    logger.info(`Monitoring service running on port ${PORT}`);
});