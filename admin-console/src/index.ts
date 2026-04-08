import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import healthRouter from './routes/health';
import config from './config';
import Database from './storage/Database';
import http from 'http';
import errorHandler from './middleware/errorHandler';
import { logRequest } from './middleware/logger';
import rateLimiter from './middleware/rateLimiter';
import { logAudit } from './middleware/auditLogger';
import { body, validationResult } from 'express-validator';

dotenv.config();
const app = express();
const server = http.createServer(app);
const db = new Database();

app.use(helmet());
app.use(cors({ origin: ['http://your-allowed-origin.com'], credentials: true }));
app.use(rateLimiter);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(logRequest);
app.use('/api/health', healthRouter);
app.use(errorHandler);

const startServer = async () => {
    await db.connect(config.databaseUrl);
    server.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });
};

startServer();

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await db.closeConnection();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Middleware for input validation and sanitization
app.use('/api/config', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        logAudit(req, res, next);
    }
]);