import express from 'express';
import { createServer } from 'http';
import strategyRoutes from './routes/strategyRoutes';
import healthRoutes from './routes/healthRoutes';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logWithRequestId, logStartup } from './logger';
import errorHandler from './middleware/errorHandler';
import { csrfMiddleware } from './middleware/csrfProtection';
import config from './config';
import { monitorMemoryUsage } from './utils/monitor';
import { gracefulShutdown } from './utils/shutdown';
import { initializeStore } from './storage/strategyStore';
import { auditLogger } from './middleware/auditLogger';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(helmet());
app.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] }));
app.use(express.json());
app.use(logWithRequestId);
app.use(auditLogger); // Add audit logger middleware

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Define API routes
app.use('/api/strategies', strategyRoutes);
app.use('/api', healthRoutes);
app.use(errorHandler);
app.use(csrfMiddleware);

// Memory monitoring
const monitorInterval = setInterval(monitorMemoryUsage, 60000);

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown(server, monitorInterval));
process.on('SIGINT', () => gracefulShutdown(server, monitorInterval));

const startServer = async () => {
    await initializeStore();
    const PORT = process.env.PORT || 3000;
    logStartup(config);
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
