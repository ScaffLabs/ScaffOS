import express from 'express';
import { createServer } from 'http';
import strategyRoutes from './routes/strategyRoutes';
import healthRoutes from './routes/healthRoutes';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logWithRequestId, logStartup } from './logger';
import errorHandler from './middleware/errorHandler';
import config from './config';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(helmet()); // Enhances API security by setting various HTTP headers
app.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] })); // Allow CORS for specified origins
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(logWithRequestId); // Middleware to log requests with a unique ID for tracing

// Rate limiter to prevent abuse of API endpoints
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter); // Apply rate limit to all API routes

// Define API routes
app.use('/api/strategies', strategyRoutes); // Routes for strategy management
app.use('/api', healthRoutes); // Health check endpoints
app.use(errorHandler); // Error handling middleware to catch and log errors

// Function to start the server
const startServer = async () => {
    const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000
    logStartup(config); // Log startup information
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`); // Log server running message
    });
};

startServer(); // Start the server