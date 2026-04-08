import express from 'express';
import { createServer } from 'http';
import { healthCheck, readyCheck, memoryHealthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool } from './connectionPool';
import { auditLogger } from './auditLogger';
import { logRequest } from './logger';
import { latencyTracker } from './latencyTracker';
import { limiter } from './rateLimiter';
import { sanitize } from './sanitize';
import helmet from 'helmet';
import cors from 'cors';
import { monitorMemoryUsage, healthCheckServices } from './serviceHealth';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

// Middleware setup
app.use(helmet()); // Set secure HTTP headers
app.use(express.json());
app.use(auditLogger);
app.use(logRequest);
app.use(latencyTracker);
app.use(limiter);
app.use(sanitize);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.get('/memory-health', memoryHealthCheck);

// Event emitter for health checks
setInterval(async () => {
    const allServicesUp = await healthCheckServices();
    if (!allServicesUp) {
        console.warn('One or more services are down.');
    }
}, 60000);

// Error handling middleware
app.use(errorMiddleware);

const server = createServer(app);

const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    connectionPool.close();
    server.close(() => {
        console.log('Closed all connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});
