import express from 'express';
import { InMemoryStore } from './storage/InMemoryStore';
import { migrateData, seedData } from './storage/migrations';
import { Position } from './types';
import logger, { logRequest, logError, logStartup, generateRequestId } from './utils/logger';
import errorHandler from './middleware/errorHandler';
import { registerShutdownHandlers, monitorMemoryUsage } from './utils/healthCheck';

const app = express();
app.use(express.json());

const positionStore = new InMemoryStore<Position>();
migrateData(positionStore, seedData());

app.use((req, res, next) => {
    const requestId = generateRequestId();
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logRequest(req.method, req.path, res.statusCode, duration, requestId);
    });
    next();
});

app.get('/api/positions', (req, res) => {
    const positions = Object.values(positionStore);
    res.status(200).json(positions);
});

app.post('/api/positions', (req, res) => {
    const newPosition = req.body;
    positionStore.create(newPosition);
    res.status(201).json({ message: 'Position created successfully', position: newPosition });
});

app.put('/api/positions/:id', (req, res) => {
    const { id } = req.params;
    const updatedPosition = positionStore.update(id, req.body);
    if (updatedPosition) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
});

app.delete('/api/positions/:id', (req, res) => {
    const { id } = req.params;
    const deleted = positionStore.delete(id);
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Position not found' });
    }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logStartup({ port: PORT });
    console.log(`Server is running on port ${PORT}`);
});

registerShutdownHandlers(server);
setInterval(monitorMemoryUsage, 60000); // Log memory usage every minute

export default app;