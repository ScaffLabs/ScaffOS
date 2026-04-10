import express from 'express';
import { createServer } from 'http';
import { healthCheck, readinessCheck, livelinessCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { logRequest, logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';
import { createConnectionPool } from './connectionPool';
import { emitHealthCheckEvent } from './serviceHealth';
import { setupRoutes } from './dashboard';
import { generalLimiter } from './rateLimiter';
import { sanitize } from './sanitize';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://example.com', 'http://another-example.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(express.json());
app.use(logRequest);
app.use(generalLimiter);
app.use(sanitize);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/alive', livelinessCheck);
app.use(errorMiddleware);

// Setup dashboard routes
setupRoutes(app);

const server = createServer(app);

server.listen(PORT, () => {
    logStartup();
    console.log(`Monitoring service running on port ${PORT}`);
    setInterval(emitHealthCheckEvent, 60000);
});

const gracefulShutdown = () => {
    console.log('Initiating graceful shutdown...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);