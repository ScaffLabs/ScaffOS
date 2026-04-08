import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import healthRouter from './routes/health';
import config from './config';
import Database from './storage/Database';
import http from 'http';
import { exit } from 'process';

dotenv.config();
const app = express();
const server = http.createServer(app);
const db = new Database();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/health', healthRouter);

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