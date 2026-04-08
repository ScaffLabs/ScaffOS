import express from 'express';
import { createServer } from 'http';
import InMemoryStore from './dataStore';
import { seedData } from './seedData';
import { healthCheck, readyCheck, memoryHealthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool } from './connectionPool';
import { auditLogger } from './auditLogger';
import { logRequest } from './logger';
import { latencyTracker } from './latencyTracker';
import { limiter } from './rateLimiter';
import { sanitize } from './sanitize';
import { monitorMemoryUsage } from './serviceHealth';

const app = express();
const PORT = process.env.PORT || 3000;
const store = new InMemoryStore<{ value: number }>();
const connectionPool = createConnectionPool();

// Middleware setup
app.use(express.json());
app.use(auditLogger);
app.use(logRequest);
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || generateRequestId();
    next();
});
app.use(latencyTracker);
app.use(limiter);
app.use(sanitize);

// Seed initial data
seedData(store);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.get('/memory-health', memoryHealthCheck);

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

setInterval(monitorMemoryUsage, 60000);

const generateRequestId = () => {
    return 'req-' + Math.random().toString(36).substr(2, 9);
};