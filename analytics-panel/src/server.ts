import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { healthCheckHandler, readyCheckHandler } from './handlers/healthCheck';
import { auditLogger } from './middleware/auditLogger';
import { getStrategiesHandler, createStrategyHandler, updateStrategyHandler, deleteStrategyHandler } from './handlers/strategyHandler';
import logger, { logStartup } from './logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { validateQueryParams } from './middleware/inputValidator';
import { validateStrategy } from './middleware/strategyValidator';
import errorHandler from './middleware/errorHandler';
import { MongoClient } from 'mongodb';
import rateLimit from 'express-rate-limit';

const app = express();
const server = createServer(app);
const io = new Server(server);
const mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');

// Middleware configurations
app.use(cors({ origin: ['http://localhost:3000', 'https://yourdomain.com'] }));
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(auditLogger);

// CSRF Protection
const csrfProtection = csurf({ cookie: true });
app.use(csrfProtection);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

// Health check endpoints
app.get('/api/health', healthCheckHandler);
app.get('/api/ready', readyCheckHandler);

// Strategy management endpoints
app.get('/api/strategies', validateQueryParams, getStrategiesHandler);
app.post('/api/strategies', validateStrategy, createStrategyHandler);
app.put('/api/strategies/:id', validateStrategy, updateStrategyHandler);
app.delete('/api/strategies/:id', deleteStrategyHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown mechanism
const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await mongoClient.close();
    await new Promise(resolve => {
        server.close(resolve);
    });
    console.log('Closed all connections.');
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const connectToDatabase = async () => {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

const PORT = process.env.PORT || 3000;
const startServer = async () => {
    await connectToDatabase();
    server.listen(PORT, () => {
        logStartup({ PORT });
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();