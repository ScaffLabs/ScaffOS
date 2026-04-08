import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import logger from './logger';
import { errorHandler } from './errors';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use('/api', apiRouter);
app.use('/health', healthRouter);

app.use(errorHandler); // Global error handler

const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
};

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});