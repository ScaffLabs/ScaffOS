import express from 'express';
import { createServer } from 'http';
import { healthCheck, readyCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { createConnectionPool } from './connectionPool';
import { auditLogger } from './auditLogger';
import { logRequest } from './logger';
import { limiter } from './rateLimiter';
import helmet from 'helmet';
import cors from 'cors';
import config from './config';

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

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
app.use(limiter);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);

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