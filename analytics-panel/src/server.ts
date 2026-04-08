import express from 'express';
import { createServer } from 'http';
import strategyRoutes from './routes/strategyRoutes';

const app = express();
const server = createServer(app);

// Middleware and other routes...
app.use('/api/strategies', strategyRoutes);

const startServer = async () => {
    // Connect to the database and start the server...
};

startServer();