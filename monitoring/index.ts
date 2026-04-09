import express from 'express';
import { createServer } from 'http';
import { healthCheck, readyCheck } from './healthCheck';
import { healthCheckServices } from './serviceHealth';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool, serviceEmitter } from './connectionPool';
import { auditLogger } from './auditLogger';
import { logRequest } from './logger';
import { limiter } from './rateLimiter';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';
import { sanitize } from './sanitize';
import InMemoryStore from './dataStore';
import { seedData } from './migrateData';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();
const store = new InMemoryStore();

// Seed data for development
seedData(store);

// CORS Configuration
app.use(cors({
    origin: ['http://example.com', 'http://another-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware setup
app.use(helmet());
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(auditLogger);
app.use(logRequest);
app.use(limiter);
app.use(sanitize);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.get('/service-health', healthCheckServices); // New service health check endpoint

// Error handling middleware
app.use(errorMiddleware);

const server = createServer(app);

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

server.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.rss / (1024 * 1024);
    const usedMemory = memoryUsage.heapUsed / (1024 * 1024);
    console.log(`Memory Usage: Total - ${totalMemory.toFixed(2)} MB, Used - ${usedMemory.toFixed(2)} MB`);
}, 60000);
