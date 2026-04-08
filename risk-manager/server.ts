import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import requestIdMiddleware from './middleware/requestIdMiddleware';
import { setReady } from './healthCheck';
import logger from './logger';
import { RiskPositionStorage, seedData } from './storage';

const app = express();
const server = http.createServer(app);
const storage = new RiskPositionStorage();

app.use(requestIdMiddleware);
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`Request: ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, { requestId: req.headers['x-request-id'] });
    });
    next();
});

app.use('/api', apiRouter);
app.use('/health', healthRouter);

const initializeDatabase = async () => {
    await seedData(storage);
};

const startServer = async () => {
    await initializeDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        setReady(true);
    });
};

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});
