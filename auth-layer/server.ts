import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './health';
import userRoutes from './userRoutes';
import errorMiddleware from './errorMiddleware';
import logger, { logRequest } from './logger';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';

const app = express();
const server = http.createServer(app);
const connectionPool = createConnectionPool();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
    origin: ['https://your-allowed-origin.com'], // Replace with your allowed origin(s)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Security headers with helmet
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());
app.use(logRequest);
app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorMiddleware);

const start = async () => {
    await connectionPool;
    monitorMemoryUsage();
    server.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
    });
};

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await connectionPool.drain();
    server.close(() => {
        logger.info('Closed out remaining connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
start();
