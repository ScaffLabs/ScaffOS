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

dotenv.config();
const app = express();
const server = http.createServer(app);
const db = new Database();

app.use(helmet());
app.use(cors());
app.use(rateLimiter);
app.use(bodyParser.json());
app.use(logRequest);
app.use((req, res, next) => {
    req.headers['x-request-id'] = Math.random().toString(36).substring(7);
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

process.on('SIGTERM', async () => {
    await db.closeConnection();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await db.closeConnection();
    process.exit(0);
});

startServer();