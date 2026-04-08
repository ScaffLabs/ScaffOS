import express from 'express';
import http from 'http';
import healthRouter from './health';
import config from './config';
import logger from './logger'; // Importing logger
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';

const app = express();
const server = http.createServer(app);
const connectionPool = createConnectionPool();

app.use(express.json());
app.use(healthRouter);

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        logger.info('Request completed', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: duration.toFixed(3),
            requestId: req.headers['x-request-id'] || 'N/A',
        });
    });
    next();
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
    if (connectionPool.isReady()) {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'not ready' });
});

const shutdown = async () => {
    logger.info('Shutting down gracefully...');
    await connectionPool.drain();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const start = async () => {
    await monitorMemoryUsage(); // Start memory monitoring
    server.listen(PORT, () => {
        logger.info(`Server listening on port ${PORT}`);
    });
};

start();
