import express from 'express';
import http from 'http';
import healthRouter from './health';
import userRoutes from './userRoutes';
import errorMiddleware from './errorMiddleware';
import logger from './logger';
import { createConnectionPool } from './database';

const app = express();
const server = http.createServer(app);
const connectionPool = createConnectionPool();

app.use(express.json());
app.use('/health', healthRouter);
app.use('/api', userRoutes);

// Error handling middleware
app.use(errorMiddleware);

const start = async () => {
    await connectionPool;
    server.listen(process.env.PORT || 3000, () => {
        logger.info(`Server listening on port ${process.env.PORT || 3000}`);
    });
};

start();