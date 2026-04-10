import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './health';
import userRoutes from './userRoutes';
import { logRequestMiddleware, errorHandlingMiddleware } from './middleware';
import logger from './logger';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';
import { initGracefulShutdown } from './shutdown';
import crypto from 'crypto';
import { sanitizeUserInput } from './userValidation';
import bodyParser from 'body-parser';
import { rateLimit as customRateLimit } from './rateLimit';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const corsOptions = {
    origin: ['http://your-allowed-origin.com'],
    optionsSuccessStatus: 200,
};

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this API key, please try again later.',
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(logRequestMiddleware);
app.use(limiter);

app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    next();
});

app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorHandlingMiddleware);

const start = async () => {
    try {
        await connectionPool.isReady();
        server.listen(PORT, () => {
            logger.info(`Server listening on port ${PORT}`, { requestId: 'startup' });
            monitorMemoryUsage();
        });
        initGracefulShutdown(server, connectionPool);
    } catch (error) {
        logger.error('Error starting server', { error: error.message });
        process.exit(1);
    }
};

start();
export default app;