import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import { setReady } from './healthCheck';
import config from './config';

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use('/api', apiRouter);
app.use('/health', healthRouter);

let connectionPool: any[] = [];

const initializeConnectionPool = () => {
    // Initialize connections to external services and store in connectionPool
};

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    // Close connections and clean up resources
    for (const connection of connectionPool) {
        await connection.close();
    }
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const startServer = async () => {
    await initializeConnectionPool();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        setReady(true);
    });
};

startServer().catch(err => {
    console.error('Failed to start the server:', err);
    process.exit(1);
});
