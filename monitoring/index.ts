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

const app = express();
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logRequest);

// Health check endpoints
app.get('/health', healthCheck);
app.get('/ready', readinessCheck);
app.get('/alive', livelinessCheck);
app.use(errorMiddleware);

const server = createServer(app);

server.listen(PORT, () => {
    logStartup();
    console.log(`Monitoring service running on port ${PORT}`);
    setInterval(emitHealthCheckEvent, 60000); // Emit health check every minute
});

// Middleware to generate request IDs
app.use((req, res, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || require('crypto').randomBytes(16).toString('hex');
    next();
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

// Graceful shutdown handling
const shutdown = async () => {
    console.log('Graceful shutdown initiated. Closing connection pool...');
    await connectionPool.close();
    console.log('Connection pool closed.');
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Adding memory monitoring
setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory Usage: RSS: ${memoryUsage.rss}, Heap Total: ${memoryUsage.heapTotal}, Heap Used: ${memoryUsage.heapUsed}`);
}, 60000); // Log memory usage every minute