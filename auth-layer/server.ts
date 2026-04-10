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
import { sanitizeUserInput } from './userValidation';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

// CORS configuration
const corsOptions = {
    origin: ['http://your-allowed-origin.com'], // Replace with your allowed origins
    optionsSuccessStatus: 200,
};

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each API key to 100 requests per windowMs
    message: 'Too many requests from this API key, please try again later.',
});

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
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