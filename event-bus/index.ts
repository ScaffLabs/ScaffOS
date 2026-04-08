import express from 'express';
import { initializeRedis } from './config/redis.config';
import { errorHandler } from './middleware/errorHandler';
import eventRoutes from './api/eventRoutes';
import logger from './logger';
import { config } from './config';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import csurf from 'csurf';
import cors from 'cors';

const app = express();

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later.' }
});

app.use(helmet());
app.use(cors({ origin: ['http://your-allowed-origin.com'], methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(limiter);
app.use(express.json());
app.use(csurf({ cookie: true }));

const main = async () => {
    await initializeRedis();
    logger.info(`Configuration: ${JSON.stringify(config)}`);
    app.use('/events', eventRoutes());
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