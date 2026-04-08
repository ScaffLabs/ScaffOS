import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './database';
import { gracefulShutdown } from './utils/shutdown';
import { healthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { monitorMemoryUsage } from './utils/monitor';
import axios from 'axios';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.json());

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);

// Adding a middleware to handle timeouts for all requests
app.use((req, res, next) => {
    res.setTimeout(5000, () => {
        console.error('Request has timed out.');
        res.status(503).send('Service Unavailable');
    });
    next();
});

// Implementing retry logic for external API calls
const fetchWithRetry = async (url, options, retries = 3, backoff = 300) => {
    try {
        return await axios(url, options);
    } catch (error) {
        if (retries === 0) throw error;
        console.log(`Retrying... attempts left: ${retries}`);
        await new Promise(res => setTimeout(res, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
};

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