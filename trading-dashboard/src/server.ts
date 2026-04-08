import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import { fetchPositions, updatePosition, deletePosition } from './api/portfolioApi';
import { validateInput } from './middleware/inputValidation';
import errorHandler from './middleware/errorHandler';
import { healthCheck, readyCheck } from './utils/healthCheck';
import { createServer } from 'http';
import logger, { logRequest, logError } from './utils/logger';
import { gracefulShutdown } from './utils/healthCheck';

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const requestId = req.headers['x-request-id'] || 'N/A';
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req.method, req.path, res.statusCode, duration, requestId);
    });
    next();
});

// Routes
app.get('/api/positions', async (req, res) => {
    try {
        const positions = await fetchPositions();
        res.json(positions);
    } catch (error) {
        logError(error, req.headers['x-request-id']);
        res.status(500).json({ message: 'Error fetching positions' });
    }
});

app.put('/api/positions/:id', validateInput, async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    try {
        await updatePosition(id, quantity);
        res.status(204).send();
    } catch (error) {
        logError(error, req.headers['x-request-id']);
        res.status(500).json({ message: 'Error updating position' });
    }
});

app.delete('/api/positions/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deletePosition(id);
        res.status(204).send();
    } catch (error) {
        logError(error, req.headers['x-request-id']);
        res.status(500).json({ message: 'Error deleting position' });
    }
});

app.get('/health', healthCheck);
app.get('/ready', readyCheck);

// Error handling middleware
app.use(errorHandler);

server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => gracefulShutdown(server));
process.on('SIGINT', () => gracefulShutdown(server));
