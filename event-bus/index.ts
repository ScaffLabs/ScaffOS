import express from 'express';
import { initializeRedis } from './config/redis.config';
import { errorHandler } from './middleware/errorHandler';
import eventRoutes from './api/eventRoutes';
import logger from './logger';
import { config } from './config';
import { v4 as uuidv4 } from 'uuid';

const app = express();

const main = async () => {
    await initializeRedis();
    logger.info(`Configuration: ${JSON.stringify(config)}`);
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
    const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });
    process.on('SIGTERM', async () => {
        logger.info('Shutting down gracefully...');
        await new Promise(resolve => server.close(resolve));
        process.exit(0);
    });
};

main();