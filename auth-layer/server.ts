import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import healthRouter from './health';
import userRoutes from './userRoutes';
import logger from './logger';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';
import { initGracefulShutdown } from './shutdown';
import crypto from 'crypto';
import { validateApiKey } from './apiKey';
import { requestSizeLimitMiddleware } from './middleware';
import { logRequest } from './logger';
import { MemoryUsageMonitor } from './memoryMonitor';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();
const memoryMonitor = new MemoryUsageMonitor();

// Middleware setup
app.use(cors({ origin: ['http://your-allowed-origin.com', 'http://another-allowed-origin.com'] }));
app.use(helmet());
app.use(express.json());
app.use(requestSizeLimitMiddleware);
app.use(logRequest);

// CSRF protection middleware
const csrfProtection = csurf();
app.use(csrfProtection);

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    next();
});

app.use('/health', healthRouter);
app.use('/api', userRoutes);

const start = async () => {
    try {
        await connectionPool.isReady();
        server.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT}`, { requestId: 'startup' });
            memoryMonitor.startMonitoring();
        });
        initGracefulShutdown(server, connectionPool);
    } catch (error) {
        logger.error('Error starting server', { error: error.message });
        process.exit(1);
    }
};

start();
export default app;