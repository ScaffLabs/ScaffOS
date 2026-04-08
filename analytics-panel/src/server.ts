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
import logger from './logger';

const app = express();
const server = createServer(app);
const io = new Server(server);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:3000'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Security headers
app.use(helmet());

// Rate limiting per IP and API key
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.',
});
app.use(apiLimiter);

// Body parsing and request size limits
app.use(bodyParser.json({ limit: '1mb' }));

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);

// Middleware for input validation
app.use((req, res, next) => {
    const contentType = req.headers['content-type'];
    if (contentType && contentType !== 'application/json') {
        return res.status(415).json({ error: 'Unsupported Media Type. Only application/json is allowed.' });
    }
    next();
});

process.on('SIGTERM', () => gracefulShutdown(server));
process.on('SIGINT', () => gracefulShutdown(server));

const startServer = async () => {
    await connectToDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Start memory monitoring every 60 seconds
    setInterval(monitorMemoryUsage, 60000);
};

startServer();