import express from 'express';
import { initializeRedis } from './config/redis.config';
import { errorHandler } from './middleware/errorHandler';
import eventRoutes from './api/eventRoutes';
import logger from './logger';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const main = async () => {
    await initializeRedis();
    app.use(express.json());
    app.use((req, res, next) => {
        const reqId = uuidv4();
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info({ method: req.method, path: req.path, status: res.statusCode, duration, reqId });
        });
        next();
    });
    app.use('/events', eventRoutes);
    app.use(errorHandler);

    const server = app.listen(3000, () => {
        logger.info('Server is running on port 3000');
    });

    // Graceful shutdown handling
    const shutdown = async () => {
        logger.info('Shutting down gracefully...');
        await new Promise(resolve => server.close(resolve));
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
};

main();