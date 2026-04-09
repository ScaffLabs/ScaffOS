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
import { sanitizeUserInput } from './userValidation';
import { ValidationError } from './errors';
import { monitorMemoryUsage } from './monitor';
import { initGracefulShutdown } from './shutdown';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(express.json());
app.use(logRequestMiddleware);

app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    next();
});

app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorHandlingMiddleware);

app.post('/api/users', async (req, res) => {
    const { username, email } = sanitizeUserInput(req.body);
    try {
        const user = await createUser(username, email);
        logger.info('User created', { userId: user.id, username: user.username });
        res.status(201).json(user);
    } catch (error) {
        logger.error('Error creating user', { error: error.message });
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors });
        }
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

const start = async () => {
    try {
        await connectionPool.isReady();
        server.listen(PORT, () => {
            startupLog('Auth Layer Service');
            logger.info(`Server listening on port ${PORT}`);
            monitorMemoryUsage(); // Start monitoring memory usage
        });
        initGracefulShutdown(server, connectionPool); // Initialize graceful shutdown
    } catch (error) {
        logger.error('Error starting server', { error: error.message });
        process.exit(1);
    }
};

start();
export default app;