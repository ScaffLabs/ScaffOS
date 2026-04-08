import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './database';
import { gracefulShutdown } from './utils/shutdown';
import { healthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { monitorMemoryUsage } from './utils/monitor';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);

process.on('SIGTERM', () => gracefulShutdown(server));
process.on('SIGINT', () => gracefulShutdown(server));

const startServer = async () => {
    await connectToDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Start memory monitoring every 60 seconds
    setInterval(monitorMemoryUsage, 60000);
};

startServer();
