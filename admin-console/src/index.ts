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
import { exit } from 'process';
import csurf from 'csurf';
import { body, validationResult } from 'express-validator';
import winston from 'winston';

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
app.use(cors({ origin: ['https://your-allowed-origin.com'], credentials: true }));

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use(limiter);

app.use(bodyParser.json({ limit: '1mb' }));
app.use(logRequest);
app.use(logAudit);
app.use(csurf());
app.use('/api/health', healthRouter);

// Health check route
app.get('/health', async (req, res) => {
    try {
        const healthStatus = { service: 'running', uptime: process.uptime(), memory: process.memoryUsage() };
        res.status(200).json(healthStatus);
    } catch (error) {
        logError(error, req, res);
    }
});

// Configuration endpoint with validation and sanitization
app.post('/api/config', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        // Assuming a function saveConfiguration exists
        await saveConfiguration(key, value);
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        logError(error, req, res);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use(logError);

server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});