import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './health';
import userRoutes from './userRoutes';
import { logRequestMiddleware, errorHandlingMiddleware } from './middleware';
import logger, { startupLog } from './logger';
import { createConnectionPool } from './database';
import { rateLimit } from './rateLimit';
import { sanitizeUserInput } from './userValidation';
import { ValidationError } from './errors';
import { monitorMemoryUsage } from './monitor';
import { initGracefulShutdown } from './shutdown';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const connectionPool = createConnectionPool();

// Allow requests from specified origins, enhancing security
const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
app.use(cors({ origin: allowedOrigins })); // Enable CORS to control which origins can access the API
app.use(helmet()); // Use Helmet to set various HTTP headers for security
app.use(express.json()); // Parse incoming JSON requests
app.use(logRequestMiddleware); // Log all incoming requests for traceability

// Rate limiting middleware to prevent abuse of the API
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !rateLimit(apiKey)) {
        return res.status(429).json({ error: 'Rate limit exceeded' }); // Respond with 429 if rate limit is exceeded
    }
    next(); // Proceed to the next middleware or route handler
});

app.use('/health', healthRouter); // Define health check route
app.use('/api', userRoutes); // Define user management routes
app.use(errorHandlingMiddleware); // Centralized error handling middleware

app.post('/api/users', async (req, res) => {
    const { username, email } = sanitizeUserInput(req.body); // Sanitize user inputs to prevent injection attacks
    try {
        const user = await createUser(username, email); // Try to create a new user
        logger.info('User created', { userId: user.id, username: user.username }); // Log successful user creation
        res.status(201).json(user); // Respond with the created user
    } catch (error) {
        logger.error('Error creating user', { error: error.message }); // Log error details
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message, details: error.errors }); // Respond with validation error details
        }
        return res.status(500).json({ error: 'Internal Server Error' }); // Handle generic server errors
    }
});

const start = async () => {
    try {
        await connectionPool.isReady(); // Check if the database connection is ready
        server.listen(PORT, () => {
            startupLog('Auth Layer Service');
            logger.info(`Server listening on port ${PORT}`); // Log successful server startup
            monitorMemoryUsage(); // Start monitoring memory usage for performance insights
        });
        initGracefulShutdown(server, connectionPool); // Setup graceful shutdown to close connections cleanly
    } catch (error) {
        logger.error('Error starting server', { error: error.message }); // Log errors during server startup
        process.exit(1); // Exit the process if the server fails to start
    }
};

start();
export default app;