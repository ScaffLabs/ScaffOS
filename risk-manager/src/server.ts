import express from 'express';
import http from 'http';
import apiRouter from './api';
import healthRouter from './healthCheck';
import { setReady } from './healthCheck';
import logger from './logger';
import { RiskPositionStorage, seedData, runMigrations } from './migrations';

const app = express();
const server = http.createServer(app);

const storage = new RiskPositionStorage();

// Initialize the database with seed data for testing and initial setup
const initializeDatabase = async () => {
    await runMigrations(storage);
};

// Start the server and listen for incoming requests
const startServer = async () => {
    await initializeDatabase(); // Ensure the database is ready before starting
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        setReady(true); // Set the service to 'ready' state
    });
};

app.use(express.json()); // Middleware to parse JSON requests
app.use('/api', apiRouter); // API routes
app.use('/health', healthRouter); // Health check endpoints

// Start the server and handle any errors during startup
startServer().catch(err => {
    logger.error('Failed to start the server:', err);
    process.exit(1); // Exit the process on failure
});