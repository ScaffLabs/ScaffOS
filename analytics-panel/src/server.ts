// Import necessary modules
import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { healthCheckHandler } from './handlers/healthCheck';
import { validateQueryParams } from './middleware/inputValidator';
import { validateStrategy } from './middleware/strategyValidator';
import { createStrategy, getStrategy, updateStrategy, deleteStrategy, findStrategies } from './services/strategyService';
import morgan from 'morgan';

const app = express();
const server = http.createServer(app);

// Middleware Setup
app.use(helmet());
app.use(cors());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan('combined'));

// Health Check Endpoint
app.get('/api/health', healthCheckHandler);

// Create Strategy
app.post('/api/strategies', validateStrategy, async (req, res) => {
    try {
        const createdStrategy = await createStrategy(req.body);
        res.status(201).json(createdStrategy);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad Request' });
    }
});

// Get Strategy by ID
app.get('/api/strategies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const strategy = await getStrategy(id);
        if (!strategy) {
            return res.status(404).json({ error: 'Not Found' });
        }
        res.status(200).json(strategy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Strategy
app.put('/api/strategies/:id', validateStrategy, async (req, res) => {
    const { id } = req.params;
    try {
        const updatedStrategy = await updateStrategy(id, req.body);
        if (!updatedStrategy) {
            return res.status(404).json({ error: 'Not Found' });
        }
        res.status(200).json(updatedStrategy);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Bad Request' });
    }
});

// Delete Strategy
app.delete('/api/strategies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const success = await deleteStrategy(id);
        if (!success) {
            return res.status(404).json({ error: 'Not Found' });
        }
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// List Strategies with Pagination, Sorting, and Filtering
app.get('/api/strategies', async (req, res) => {
    const { limit = 10, offset = 0, sort = 'name', order = 'asc' } = req.query;
    try {
        const strategies = await findStrategies({}); // You can implement filtering logic here based on query params.
        const sortedStrategies = strategies.sort((a, b) => {
            const modifier = order === 'asc' ? 1 : -1;
            return a.data[sort] > b.data[sort] ? modifier : -modifier;
        });
        const paginatedStrategies = sortedStrategies.slice(Number(offset), Number(offset) + Number(limit));
        res.status(200).json(paginatedStrategies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3000;
let serverInstance;

const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    serverInstance.close(() => {
        console.log('Closed all connections.');
        process.exit(0);
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

serverInstance = server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
