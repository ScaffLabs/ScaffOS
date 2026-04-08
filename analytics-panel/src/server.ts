import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { healthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { dependentHealthCheckHandler } from './handlers/dependentHealthCheck';
import { auditLogger } from './middleware/auditLogger';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler } from './handlers/strategyHandler';
import logger, { logStartup } from './logger';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware configurations
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(auditLogger);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);
app.get('/api/dependent-health', dependentHealthCheckHandler);

// Strategy management endpoints
app.get('/api/strategies', getStrategiesHandler);
app.post('/api/strategies', createStrategyHandler);
app.put('/api/strategies/:id', updateStrategyHandler);
app.delete('/api/strategies/:id', deleteStrategyHandler);

// Graceful shutdown mechanism
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