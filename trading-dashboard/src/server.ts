import express from 'express';
import { healthCheck } from './api/externalApi';
import { InMemoryStore } from './storage/InMemoryStore';
import { migrateData, seedData } from './storage/migrations';
import { Position } from './types';
import logger, { logStartup } from './utils/logger';
import errorHandler from './middleware/errorHandler';

const app = express();
app.use(express.json());

const positionStore = new InMemoryStore<Position>();
migrateData(positionStore, seedData());

app.get('/api/health', healthCheck);
app.get('/api/ready', async (req, res) => {
    try {
        const externalHealth = await checkExternalServiceHealth();
        res.status(externalHealth.status === 'UP' ? 200 : 500).send(externalHealth);
    } catch (error) {
        res.status(500).send({ status: 'NOT READY', error: error.message });
    }
});

app.get('/api/positions', async (req, res) => {
    try {
        const positions = await positionStore.findByIndex('symbol', 'AAPL');
        res.status(200).json(positions);
    } catch (error) {
        logger.error(error.message);
        res.status(500).json({ message: 'Error fetching positions', error: error.message });
    }
});

app.post('/api/positions', async (req, res) => {
    const newPosition = req.body;
    try {
        const createdPosition = positionStore.create(newPosition);
        res.status(201).json({ message: 'Position created successfully', position: createdPosition });
    } catch (error) {
        logger.error(error.message);
        res.status(400).json({ message: 'Invalid position data', error: error.message });
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logStartup({ port: PORT });
    console.log(`Server is running on port ${PORT}`);
});

export default app;