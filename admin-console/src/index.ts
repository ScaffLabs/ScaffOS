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

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(helmet());
app.use(cors({ origin: ['https://your-allowed-origin.com'], credentials: true }));

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

server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});
// Graceful shutdown implementation
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);