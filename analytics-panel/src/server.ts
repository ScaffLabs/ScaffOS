import express from 'express';
import { createServer } from 'http';
import strategyRoutes from './routes/strategyRoutes';
import healthRoutes from './routes/healthRoutes';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logWithRequestId } from './logger';
import { monitorMemoryUsage } from './utils/monitor';
import { gracefulShutdown } from './utils/shutdown';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(helmet()); // Security headers
app.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] })); // CORS setup
app.use(express.json()); // JSON body parser
app.use(logWithRequestId); // Request ID logging

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter); // Apply rate limiting to all routes

// Routes
app.use('/api/strategies', strategyRoutes);
app.use('/api', healthRoutes);

const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

const monitorInterval = setInterval(monitorMemoryUsage, 60000); // Monitor memory usage every 60 seconds

process.on('SIGTERM', () => gracefulShutdown(server, monitorInterval));
process.on('SIGINT', () => gracefulShutdown(server, monitorInterval));

startServer();
