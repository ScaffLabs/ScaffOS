import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { dependentHealthCheckHandler } from './handlers/dependentHealthCheck';
import { auditLogger } from './middleware/auditLogger';
import logger, { logStartup } from './logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Pool } from 'pg'; // Example for connection pooling

const app = express();
const server = createServer(app);
const io = new Server(server);

// Database connection pooling
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Middleware configurations
app.use(cors({
    origin: ['https://your-allowed-origin.com'],
    methods: ['GET', 'POST'],
}));
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(auditLogger);

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);
app.get('/api/dependent-health', dependentHealthCheckHandler);

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await new Promise(resolve => {
        server.close(resolve);
    });
    await pool.end(); // Close database connections
    console.log('Closed all connections.');
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logStartup({ PORT });
    console.log(`Server is running on port ${PORT}`);
});
