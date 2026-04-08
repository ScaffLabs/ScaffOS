import express from 'express';
import { createServer } from 'http';
import { healthCheck, readyCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool } from './connectionPool';
import { auditLogger } from './auditLogger';
import logger, { logRequest, logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

// Startup logging
logStartup();

// CORS Configuration
app.use(cors({
    origin: ['http://example.com', 'http://another-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware setup
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(auditLogger);
app.use(logRequest);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);

// Error handling middleware
app.use(errorMiddleware);

const server = createServer(app);

const gracefulShutdown = () => {
    logger.info('Shutting down gracefully...');
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
    logger.info(`Monitoring service running on port ${PORT}`);
});