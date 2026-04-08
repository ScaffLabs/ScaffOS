import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './database';
import { gracefulShutdown } from './utils/shutdown';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { healthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { monitorMemoryUsage } from './utils/monitor';
import logger, { logWithRequestId } from './logger';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(logWithRequestId);
app.use(cors({
    origin: ['http://localhost:3000'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use(apiLimiter);

app.use(bodyParser.json({ limit: '1mb' }));

app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);

process.on('SIGTERM', () => gracefulShutdown(server));
process.on('SIGINT', () => gracefulShutdown(server));

const startServer = async () => {
    await connectToDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });

    setInterval(monitorMemoryUsage, 60000);
};

startServer();