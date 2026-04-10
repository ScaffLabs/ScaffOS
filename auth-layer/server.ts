import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './health';
import userRoutes from './userRoutes';
import { logRequestMiddleware, errorHandlingMiddleware } from './middleware';
import logger, { logRequest } from './logger';
import { createConnectionPool } from './database';
import { rateLimit } from './rateLimit';
import { monitorMemoryUsage } from './monitor';
import { initGracefulShutdown } from './shutdown';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logRequestMiddleware);

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
