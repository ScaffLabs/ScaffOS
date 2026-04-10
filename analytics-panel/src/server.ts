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
import mongoose from 'mongoose';
import { gracefulShutdown } from './utils/shutdown';
import { monitorMemoryUsage } from './utils/monitor';
import { dependentHealthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { connectToDatabase } from './utils/dbConnection';
import { auditLogger, validateInputBody, validateRequestSize } from './middleware/auditLogger';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(helmet());
app.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] }));
app.use(express.json());
app.use(logWithRequestId);

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
app.use('/api/health/dependencies', dependentHealthCheckHandler);
app.use('/api/ready', readyCheckHandler);
app.use(errorHandler);
app.use(csrfMiddleware);

const startServer = async () => {
    try {
        await connectToDatabase();
        const PORT = process.env.PORT || 3000;
        logStartup(config);
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        setInterval(monitorMemoryUsage, 60000); // Monitor memory usage every minute
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();

const handleShutdown = () => {
    console.log('Received shutdown signal. Gracefully shutting down...');
    mongoose.connection.close(() => {
        console.log('MongoDB connections closed.');
    });
    server.close(() => {
        console.log('Closed all connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

export default app;