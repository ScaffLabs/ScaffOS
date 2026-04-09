import express from 'express';
import { createServer } from 'http';
import { healthCheck, readinessCheck, livelinessCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { logRequest, logStartup } from './logger';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';
import { createConnectionPool } from './connectionPool';
import { emitHealthCheckEvent, healthCheckServices } from './serviceHealth';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://example.com', 'http://another-example.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(express.json());
app.use(logRequest);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/health/services', healthCheckServices);
app.get('/ready', readinessCheck);
app.get('/alive', livelinessCheck);
app.use(errorMiddleware);

const server = createServer(app);

server.listen(PORT, () => {
    logStartup();
    console.log(`Monitoring service running on port ${PORT}`);
    setInterval(emitHealthCheckEvent, 60000);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});