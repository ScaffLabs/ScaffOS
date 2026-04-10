import express from 'express';
import { createServer } from 'http';
import { healthCheck, readyCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { logRequest, logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';
import { createConnectionPool } from './connectionPool';
import { emitHealthCheckEvent } from './serviceHealth';
import { setupRoutes } from './dashboard';
import { generalLimiter, apiKeyLimiter } from './rateLimiter';
import { sanitize, csrfProtection } from './sanitize';

const app = express();
const PORT = config.PORT;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://example.com', 'http://another-example.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(logRequest);
app.use(generalLimiter);
app.use(apiKeyLimiter);
app.use(sanitize);
app.use(csrfProtection);

app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.use(errorMiddleware);
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
process.on('uncaughtException', (error) => {
    console.error('Unhandled Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});
