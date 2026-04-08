import express from 'express';
import { createServer } from 'http';
import InMemoryStore from './dataStore';
import { seedData } from './seedData';
import { healthCheck, readyCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool } from './connectionPool';
import { auditLogger } from './auditLogger';
import { logRequest } from './logger';
import { latencyTracker } from './latencyTracker';
import { limiter } from './rateLimiter';
import { sanitize } from './sanitize';

const app = express();
const PORT = process.env.PORT || 3000;
const store = new InMemoryStore<{ value: number }>();
const connectionPool = createConnectionPool();

// Middleware setup
app.use(express.json());
app.use(auditLogger);
app.use(logRequest);
app.use(latencyTracker);
app.use(limiter);
app.use(sanitize);

// Seed initial data
seedData(store);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);

// Error handling middleware
app.use(errorMiddleware);

const server = createServer(app);

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    // Close the connection pool
    connectionPool.close();
    // Wait for existing connections to finish
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
