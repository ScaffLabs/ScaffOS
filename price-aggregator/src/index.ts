import express from 'express';
import http from 'http';
import { createConnectionPool } from './dbConnection';
import errorMiddleware from './errorMiddleware';
import { MemoryMonitor } from './memoryMonitor';
import { config } from './config';
import { logStartup } from './logger';
import { requestQueueMiddleware } from './middleware/requestQueueingMiddleware';

const app = express();
const server = http.createServer(app);
const dbPool = createConnectionPool();
const memoryMonitor = new MemoryMonitor();

app.use(express.json());
app.use(requestQueueMiddleware);
app.use(errorMiddleware);

app.get('/health', async (req, res) => {
    try {
        await dbPool.query('SELECT 1');
        return res.status(200).json({ status: 'healthy' });
    } catch (error) {
        return res.status(500).json({ status: 'unhealthy', error: error.message });
    }
});

app.get('/ready', async (req, res) => {
    return res.status(200).json({ status: 'ready' });
});

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await dbPool.drain();
    server.close(() => {
        console.log('Server shutdown complete.');
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

server.listen(config.port, () => {
    logStartup({ port: config.port });
    setInterval(() => {
        memoryMonitor.logMemoryUsage();
    }, 60000);
});
