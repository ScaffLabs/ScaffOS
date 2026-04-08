import express from 'express';
import http from 'http';
import healthRouter from './health';
import config from './config';
import { createConnectionPool } from './database';
import { monitorMemoryUsage } from './monitor';

const app = express();
const server = http.createServer(app);
const connectionPool = createConnectionPool();

app.use(express.json());
app.use(healthRouter);

const PORT = process.env.PORT || 3000;

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.get('/ready', (req, res) => {
    // Check if the connection pool is ready
    if (connectionPool.isReady()) {
        return res.status(200).json({ status: 'ready' });
    }
    res.status(503).json({ status: 'not ready' });
});

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await connectionPool.drain(); // Drain connections
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const start = async () => {
    await monitorMemoryUsage(); // Start memory monitoring
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};

start();
