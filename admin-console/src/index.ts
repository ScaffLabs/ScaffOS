import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import healthRouter from './routes/health';
import config from './config';
import Database from './storage/Database';
import http from 'http';
import { exit } from 'process';
import errorHandler from './middleware/errorHandler';
import { logRequest } from './middleware/logger';
import { logAudit } from './middleware/auditLogger';
import { body, validationResult } from 'express-validator';
import xss from 'xss-clean';

dotenv.config();
const app = express();
const server = http.createServer(app);
const db = new Database();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

app.use(helmet());
app.use(cors({ origin: ['http://your-allowed-origin.com'], credentials: true }));
app.use(limiter);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(xss()); // XSS protection
app.use(logRequest);
app.use((req, res, next) => {
    if (!req.is('application/json')) {
        return res.status(415).send({ error: 'Content type must be application/json' });
    }
    next();
});
app.use('/api/health', healthRouter);
app.use(errorHandler);

const startServer = async () => {
    await db.connect(config.databaseUrl);
    server.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
    });
};

const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await db.closeConnection();
    server.close(() => {
        console.log('HTTP server closed');
        exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.post('/api/config', [
    body('key').trim().escape().notEmpty().withMessage('Key is required'),
    body('value').trim().escape().notEmpty().withMessage('Value is required'),
], logAudit, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { key, value } = req.body;
        await db.createConfiguration({ key, value });
        res.status(201).json({ message: 'Configuration created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use((req, res, next) => {
    const auditData = {
        method: req.method,
        path: req.path,
        body: req.body,
        userId: req.user ? req.user.id : null
    };
    console.log('Audit Log:', auditData);
    next();
});