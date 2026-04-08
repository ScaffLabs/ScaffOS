import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import healthRouter from './routes/health';
import config from './config';
import { logRequest, logError } from './middleware/logger';
import { logAudit } from './middleware/auditLogger';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import { createConnection } from 'mysql2/promise';
import { exit } from 'process';

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Graceful shutdown
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await mongoose.connection.close();
    server.close(() => {
        console.log('HTTP server closed');
        exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.use(bodyParser.json());
app.use(logRequest);
app.use(logAudit);
app.use('/api/health', healthRouter);

// Health check route
app.get('/health', async (req, res) => {
    try {
        // Example health check logic
        const dbConnection = await createConnection({host: 'localhost', user: 'root', database: 'test'});
        const healthStatus = dbConnection ? 'up' : 'down';
        res.status(200).json({ service: 'running', database: healthStatus });
    } catch (error) {
        res.status(500).json({ error: 'Service is down' });
    }
});

app.use(logError);

server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});