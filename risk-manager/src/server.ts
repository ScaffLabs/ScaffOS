import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import { setReady } from './healthCheck';
import logger from './logger';
import { RiskPositionStorage, seedData } from './storage';

const app = express();
const server = http.createServer(app);

const storage = new RiskPositionStorage();

const initializeDatabase = async () => {
    await seedData(storage);
};

const startServer = async () => {
    await initializeDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        setReady(true);
    });
};

app.use(express.json());
app.use('/api', apiRouter);
app.use('/health', healthRouter);

startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1);
});