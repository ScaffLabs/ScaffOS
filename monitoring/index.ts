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
app.use(helmet()); // Set secure HTTP headers
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(auditLogger);
app.use(logRequest);
app.use(latencyTracker);
app.use(limiter);
app.use(sanitize);

// Health Check Endpoints
app.get('/health', healthCheck);
app.get('/ready', readyCheck);
app.get('/memory-health', memoryHealthCheck);

// Error handling middleware
app.use(errorMiddleware);

const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});