import express from 'express';
import http from 'http';
import { healthCheckHandler } from './handlers/healthCheck';

const app = express();
const server = http.createServer(app);

app.get('/api/health', healthCheckHandler);

const PORT = process.env.PORT || 3000;
let serverInstance;

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    serverInstance.close(() => {
        console.log('Closed all connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

serverInstance = server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
