import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './health';
import userRoutes from './userRoutes';
import { logRequestMiddleware, errorHandlingMiddleware } from './middleware';
import logger, { startupLog } from './logger';
import { createConnectionPool } from './database';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(logRequestMiddleware);

app.use('/health', healthRouter);
app.use('/api', userRoutes);
app.use(errorHandlingMiddleware);

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