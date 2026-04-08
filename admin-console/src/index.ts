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

startServer();