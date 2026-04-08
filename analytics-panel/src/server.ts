import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheckHandler } from './handlers/healthCheck';
import { dependentHealthCheckHandler } from './handlers/dependentHealthCheck';
import { auditLogger } from './middleware/auditLogger';
import { validateQueryParams } from './middleware/inputValidator';
import { validateStrategy } from './middleware/strategyValidator';
import logger, { logStartup } from './logger';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

// CORS configuration
app.use(cors({
    origin: ['https://your-allowed-origin.com'],
    methods: ['GET', 'POST'],
}));

// Security middleware
app.use(helmet());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use(express.json());
app.use(auditLogger);

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/dependent-health', dependentHealthCheckHandler);

// Graceful shutdown logic
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await new Promise(resolve => {
        server.close(resolve);
    });
    console.log('Closed all connections.');
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logStartup({ PORT });
    console.log(`Server is running on port ${PORT}`);
});
