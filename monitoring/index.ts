import express from 'express';
import { dashboard, createDashboardEntry, updateDashboardEntry, deleteDashboardEntry, listDashboardEntries } from './dashboard';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { limiter } from './rateLimiter';
import { latencyTracker } from './latencyTracker';
import { checkServiceHealth } from './serviceHealth';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import { sanitize } from './sanitize';
import { auditLogger } from './auditLogger';
import config from './config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { EventEmitter } from 'events';
import logger, { logRequest, logError, logStartup } from './logger';

const app = express();
const PORT = config.PORT;
const server = createServer(app);
const io = new Server(server);
const eventEmitter = new EventEmitter();

app.use(helmet());
app.use(cors({ origin: ['https://example.com', 'https://another-domain.com'] }));
app.use(limiter);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(latencyTracker);
app.use(auditLogger);
app.use(logRequest);

app.get('/health', healthCheck);
app.get('/dashboard', listDashboardEntries);
app.post('/dashboard', sanitize, createDashboardEntry);
app.put('/dashboard/:id', sanitize, updateDashboardEntry);
app.delete('/dashboard/:id', deleteDashboardEntry);
app.get('/health/aggregate', checkServiceHealth);
app.use(errorMiddleware);

process.on('uncaughtException', (error) => {
    logError(error);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
});

server.listen(PORT, () => {
    logStartup();
    logger.info(`Monitoring service running on port ${PORT}`);
});

const gracefulShutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);