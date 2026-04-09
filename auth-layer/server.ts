import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import healthRouter from './health';
import userRoutes from './userRoutes';
import errorMiddleware from './errorMiddleware';
import logger, { startupLog } from './logger';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';
import { logRequest } from './logger';
import { csrfMiddleware } from './middleware';
import config from './config';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
const corsOptions = {
    origin: allowedOrigins,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(logRequest);

app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorMiddleware);
app.use(csrfMiddleware);

const start = async () => {
    try {
        await connectionPool.isReady();
        monitorMemoryUsage();
        server.listen(PORT, () => {
            startupLog(`Auth Layer Service`);
            logger.info(`Server listening on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Error starting server', { error: error.message });
        process.exit(1);
    }
};

start();