import express from 'express';
import { createServer } from 'http';
import strategyRoutes from './routes/strategyRoutes';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { logWithRequestId } from './logger';
import { healthCheckHandler } from './handlers/healthCheck';

const app = express();
const server = createServer(app);

// Middleware setup
app.use(helmet()); // Security headers
app.use(cors({ origin: ['http://example.com', 'http://localhost:3000'] })); // CORS setup
app.use(express.json()); // JSON body parser
app.use(logWithRequestId); // Request ID logging

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter); // Apply rate limiting to all routes

// Routes
app.use('/api/strategies', strategyRoutes);
app.get('/api/health', healthCheckHandler);

const startServer = async () => {
    // Connect to the database and start the server...
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();