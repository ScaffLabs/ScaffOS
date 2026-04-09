import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './health';
import userRoutes from './userRoutes';
import { logRequestMiddleware, errorHandlingMiddleware } from './middleware';
import logger, { startupLog } from './logger';
import { createConnectionPool } from './database';
import { rateLimit } from './rateLimit';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(express.json());
app.use(logRequestMiddleware);

app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorHandlingMiddleware);

app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
});

const start = async () => {
    try {
        await connectionPool.isReady();
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
export default app;