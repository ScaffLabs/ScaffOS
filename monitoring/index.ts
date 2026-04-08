import express from 'express';
import { dashboard } from './dashboard';
import { healthCheck } from './healthCheck';
import errorMiddleware from './errorMiddleware';
import { limiter } from './rateLimiter';
import { latencyTracker } from './latencyTracker';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Middleware to track latency of requests
app.use(latencyTracker);
// Rate limiting middleware
app.use(limiter);
// Health check endpoint
app.get('/health', healthCheck);
// Dashboard endpoint
app.get('/dashboard', dashboard);
// Error handling middleware
app.use(errorMiddleware);

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

app.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);
});